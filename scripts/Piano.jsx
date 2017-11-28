var _ = require('underscore');
var S = require('string');
var s11 = require('sharp11');
var React = require('react');
var Tabs = require('react-tabs');
var PianoKey = require('./PianoKey.jsx');
var PianoControls = require('./PianoControls.jsx');
var Theorizer = require('./Theorizer.jsx');
var Improviser = require('./Improviser.jsx');
var Automaton = require('./Automaton.jsx');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      acc: 'b',
      pressedKeys: [],
      value: '',
      improv: ''
    };
  },

  pressedNotes: function () {    
    return _.map(_.sortBy(this.state.pressedKeys), function (value) {
      return s11.note.fromValue(value).withAccidental(this.state.acc);
    }, this);
  },

  toggleAccidentals: function () {
    this.setState({acc: this.state.acc === 'b' ? '#' : 'b'});
  },

  // Given a sharp11 object, turn its corresponding keys on and all others off
  // Used as callback for play function
  showObjOnPiano: function (obj, note) {
    var notes = [note];

    // If the object we're displaying is a chord or an array, show all the notes at once
    if (s11.chord.isChord(obj)) {
      notes = obj.chord;
    }
    if (obj instanceof Array) {
      notes = obj;
    }

    this.setState({pressedKeys: _.invoke(notes, 'value')});
  },

  pressKey: function (note) {
    var key = note.value();
    if (_.contains(this.state.pressedKeys, key)) {
      this.setState({pressedKeys: _.without(this.state.pressedKeys, key)});
    }
    else {
      this.setState({pressedKeys: this.state.pressedKeys.concat(key)});
      this.props.play(note);
    }
  },

  clearPiano: function () {
    this.setState({pressedKeys: []});
  },

  transpose: function (interval) {
    var notes = _.invoke(this.pressedNotes(), 'transpose', S(interval).strip(' ').s);
    var range = this.props.range;

    // Throw error for the sake of this.play
    if (!notes.length) throw new Error();

    // Remove notes that are out of range
    notes = _.filter(notes, function (note) {
      return note.inRange(range);
    });

    this.props.play(notes, null, null, this.showObjOnPiano);
  },

  // Put chord or scale in proper octave
  setOctave: function (obj) {
    var obj = obj.inOctave(this.props.defaultOctave);
    var highestNote = _.last(obj.chord || obj.scale);

    if (!highestNote.inRange(this.props.range)) {
      obj = obj.inOctave(this.props.defaultOctave - 1);
    }

    return obj;
  },

  playChord: function (chord) {
    chord = this.setOctave(s11.chord.create(S(chord).strip(' ').s));
    this.props.play(chord, null, null, this.showObjOnPiano);
  },

  playScale: function (scale) {
    var root = scale.split(' ')[0];
    var scaleName = S(_.rest(scale.split(' ')).join(' ')).collapseWhitespace().s;

    // Throw error for the sake of this.play
    if (S(scaleName).isEmpty()) throw new Error();
    
    scale = this.setOctave(s11.scale.create(root, scaleName));
    this.props.play(scale, null, null, this.showObjOnPiano);
  },

  playImprov: function (chart, settings) {
    var piano = this;

    settings = _.defaults(settings || {}, {
      tempo: 120, // BPM
      swingRatio: 1.5, // How much longer first eighth note is than second
      chordOctave: this.props.range[0].octave
    });

    this.stop();

    // Play chords
    _.reduce(chart.data, function (currentTime, change) {
      var changeLength = change.duration.value() / settings.tempo * 60;
      var chord = change.chord.inOctave(settings.chordOctave);
      var changeStr = change.scale ? change.chord.name + ' \u2192 ' + change.scale.name : '';

      piano.props.play(chord, currentTime, changeLength, function () {
        piano.setState({improv: changeStr});
      });

      return currentTime + changeLength;
    }, 0);

    // Play notes
    _.reduce(chart.notesAndDurations(), function (currentTime, noteObj) {
      var noteLength = noteObj.duration.value() / settings.tempo * 60;

      if (noteObj.note) {
        piano.props.play(noteObj.note, currentTime, noteLength, piano.showObjOnPiano);
      }

      return currentTime + noteLength;
    }, 0);
  },

  identify: function () {
    var notes = this.pressedNotes();

    if (notes.length < 2) {
      return '';
    }
    else if (notes.length === 2) {
      return notes[0].getInterval(notes[1]).toString();
    }
    else {
      return s11.chord.identify.apply(this, notes);
    }
  },

  display: function () {
    return this.identify() || this.state.improv;
  },

  handleInput: function (e) {
    this.setState({value: e.target.value});
  },

  play: function () {
    var value = S(this.state.value).trim().s;

    // If the user hasn't entered anything, replay selected notes
    if (!value) {
      this.props.play(this.pressedNotes());
    }
    // If the user has entered "scale" or "chord", interpret appropriately
    else if (S(value).contains('scale')) {
      this.playScale(S(value).strip('scale').s);
    }
    else if (S(value).contains('chord')) {
      this.playChord(S(value).strip('chord').s);
    }
    // Otherwise, see what works
    else {
      // Test for interval
      try {
        this.transpose(value);
      }
      catch (e) {
        console.log(e);
        // Test for scale
        try {
          this.playScale(value);
        }
        catch (e) {
          // Assume chord
          this.playChord(value);
        }
      }
    }
  },

  stop: function () {
    this.clearPiano();
    this.props.stop();
    this.setState({improv: '', value: ''});
  },

  render: function () {
    var pianoKeys = [];
    var note = this.props.range[0];
    var key;

    while (note.inRange(this.props.range)) {
      key = note.value();

      pianoKeys.push(<PianoKey
        note={note}
        acc={this.state.acc}
        key={key}
        pressed={_.contains(this.state.pressedKeys, key)}
        pressKey={this.pressKey.bind(this, note)}
      />);

      note = note.sharp().clean();
    }

    return (
      <div>
        <div className="row col-md-12">
          <div>{pianoKeys}</div>
          <PianoControls display={this.display} toggleAccidentals={this.toggleAccidentals} stop={this.stop} />
        </div>
        <div className="row">
          <Tabs.Tabs selectedTabClassName="active">
            <div className="col-md-12">
              <Tabs.TabList className="nav nav-pills nav-justified">
                <Tabs.Tab><a href="#">Theory Engine</a></Tabs.Tab>
                <Tabs.Tab><a href="#">Improviser</a></Tabs.Tab>
                <Tabs.Tab><a href="#">Jazz Automaton</a></Tabs.Tab>
              </Tabs.TabList>
            </div>
            <Tabs.TabPanel>
              <Theorizer play={this.play} handleInput={this.handleInput} value={this.state.value} />
            </Tabs.TabPanel>
            <Tabs.TabPanel>
              <Improviser playImprov={this.playImprov} stop={this.stop} songs={this.props.songs} />
            </Tabs.TabPanel>
            <Tabs.TabPanel>
              <Automaton playChord={this.playChord} jza={this.props.jza} />
            </Tabs.TabPanel>
          </Tabs.Tabs>
        </div>
      </div>
    );
  }
});
var _ = require('underscore');
var S = require('string');
var s11 = require('sharp11');
var React = require('react');
var PianoKey = require('./PianoKey.jsx');
var PianoControls = require('./PianoControls.jsx');
var Theorizer = require('./Theorizer.jsx');
var Improviser = require('./Improviser.jsx');

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
    var notes = _.invoke(this.pressedNotes(), 'transpose', interval);
    this.props.play(notes, null, null, this.showObjOnPiano);
  },

  playChord: function (chord) {
    chord = s11.chord.create(chord, this.props.chordOctave);
    this.props.play(chord, null, null, this.showObjOnPiano);
  },

  playScale: function (scale) {
    var root = scale.split(' ')[0];
    var scaleName = _.rest(scale.split(' ')).join(' ');
    
    scale = s11.scale.create(root, scaleName).inOctave(this.props.chordOctave);
    this.props.play(scale, null, null, this.showObjOnPiano);
  },

  playImprov: function (chart, settings) {
    var piano = this;

    settings = _.defaults(settings || {}, {
      tempo: 120, // BPM
      swingRatio: 1.5, // How much longer first eighth note is than second
      chordOctave: 3
    });

    this.stop();

    // Play chords
    _.reduce(chart.chart, function (currentTime, change) {
      var changeLength = change.notes.length / settings.tempo * 60;
      var chord = change.chord.inOctave(settings.chordOctave);
      var changeStr = change.chord.name + ' \u2192 ' + change.scale.name;

      piano.props.play(chord, currentTime, changeLength, function () {
        piano.setState({improv: changeStr});
      });

      return currentTime + changeLength;
    }, 0);

    // Play notes
    _.reduce(chart.noteList, function (currentTime, note) {
      // Use the exposed noteLength function from sharp11 midi library
      var noteTicks = s11.midi.noteLength(note.duration, settings);

      // Convert ticks to seconds
      var ticksPerBeat = 96;
      var noteLength = noteTicks / ticksPerBeat / settings.tempo * 60;

      if (note.note) {
        piano.props.play(note.note, currentTime, noteLength, piano.showObjOnPiano);
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
    this.setState({value: S(e.target.value).trim().s});
  },

  play: function () {
    var value = this.state.value;

    // Scale
    if (S(value).contains(' ')) {
      this.playScale(value);
    }

    // Interval
    else if (/^(m|p|dim|aug)/i.test(value)) {
      this.transpose(value);
    }

    // Chord
    else if (/^[a-g]/i.test(value)) {
      this.playChord(value);
    }
  },

  stop: function () {
    this.clearPiano();
    this.props.stop();
    this.setState({improv: ''});
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
          <Theorizer play={this.play} handleInput={this.handleInput} />
          <Improviser playImprov={this.playImprov} songs={this.props.songs} />
        </div>
      </div>
    );
  }
});
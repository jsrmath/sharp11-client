var _ = require('underscore');
var s11 = require('sharp11');
var React = require('react');
var PianoKey = require('./PianoKey.jsx');

var chart = s11.improv.create({dissonance: 0}).over('chart', require('../node_modules/sharp11/sample/charts').myFunnyValentineFull);

module.exports = React.createClass({
  getInitialState: function () {
    return {
      acc: 'b',
      pressedKeys: [],
    };
  },

  pressedNotes: function () {
    var that = this;
    
    return _.map(_.sortBy(this.state.pressedKeys), function (value) { // TODO: Implement note.fromValue
      var octave = Math.floor(value / 12);
      var note = s11.note.create('C', octave).shift(value % 12).clean();

      if (that.state.acc !== note.acc) {
        note = note.toggleAccidental();
      }

      return note;
    });
  },

  noteValue: function (note) {
    return s11.midi.noteValue(note);
  },

  toggleAccidentals: function () {
    this.setState({acc: this.state.acc === 'b' ? '#' : 'b'});
  },

  // Given a sharp11 object, turn its corresponding keys on and all others off
  // Used as callback for play function
  playObj: function (obj, note) {
    var notes = [note];

    // If the object we're displaying is a chord or an array, show all the notes at once
    if (s11.chord.isChord(obj)) {
      notes = obj.chord;
    }
    if (obj instanceof Array) {
      notes = obj;
    }

    this.setState({pressedKeys: _.map(notes, this.noteValue)});
  },

  pressKey: function (note) {
    var key = this.noteValue(note);
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
    this.props.play(notes, null, null, this.playObj);
  },

  playChord: function (chord) {
    chord = chord.inOctave(this.props.chordOctave);
    this.props.play(chord, null, null, this.playObj);
  },

  playScale: function (scale) {
    scale = scale.traverse(s11.note.create(scale.root, this.props.chordOctave)).scale; // TODO: implement .inOctave
    this.props.play(scale, null, null, this.playObj);
  },

  playImprov: function (chart, settings) {
    var that = this;

    settings = _.defaults(settings || {}, {
      tempo: 120, // BPM
      swingRatio: 1.5, // How much longer first eighth note is than second
      chordOctave: 3
    });

    that.clearPiano();

    // Play chords
    _.reduce(chart.chart, function (currentTime, change) {
      var changeLength = change.notes.length / settings.tempo * 60;
      that.props.play(change.chord.inOctave(settings.chordOctave), currentTime, changeLength);
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
        that.props.play(note.note, currentTime, noteLength, that.playObj);
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

  render: function () {
    var pianoKeys = [];
    var note = this.props.range[0];
    var key;

    while (note.inRange(this.props.range)) {
      key = s11.midi.noteValue(note);

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
        <div className="piano">{pianoKeys}</div>
        <button onClick={this.toggleAccidentals}>Toggle Accidentals</button>
        <button onClick={this.clearPiano}>Clear Piano</button>
        <button onClick={this.playChord.bind(this, s11.chord.create('Fsus7'))}>Play Chord</button>
        <button onClick={this.playScale.bind(this, s11.scale.create('D', 'Dorian'))}>Play Scale</button>
        <button onClick={this.playImprov.bind(this, chart)}>Play Improv</button>
        <button onClick={this.transpose.bind(this, 'aug4')}>Transpose</button>
        <div>{this.identify()}</div>
        <button onClick={this.props.stop}>Stop</button>
      </div>
    );
  }
});
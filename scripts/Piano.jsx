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

  noteValue: function (note) {
    return s11.midi.noteValue(note);
  },

  toggleAccidentals: function () {
    this.setState({acc: this.state.acc === 'b' ? '#' : 'b'});
  },

  // Given a sharp11 object, turn its corresponding keys on and all others off
  showObjKeys: function (obj) {
    var notes;

    if (s11.chord.isChord(obj)) notes = obj.chord;
    if (s11.note.isNote(obj)) notes = [obj];

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

  playChord: function (chord) {
    chord = chord.inOctave(this.props.chordOctave);
    this.props.play(chord, null, null, this.showObjKeys.bind(this, chord));
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
        that.props.play(note.note, currentTime, noteLength, that.showObjKeys.bind(that, note.note));
      }

      return currentTime + noteLength;
    }, 0);
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
        <button onClick={this.playImprov.bind(this, chart)}>Play Improv</button>
      </div>
    );
  }
});
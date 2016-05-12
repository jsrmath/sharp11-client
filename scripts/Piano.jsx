var _ = require('underscore');
var s11 = require('sharp11');
var React = require('react');
var PianoKey = require('./PianoKey.jsx');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      acc: 'b',
      pressedKeys: [],
    };
  },

  toggleAccidentals: function () {
    this.setState({acc: this.state.acc === 'b' ? '#' : 'b'});
  },

  keyOn: function (key) {
    this.setState({pressedKeys: this.state.pressedKeys.concat(key)});
  },

  keyOff: function (key) {
    this.setState({pressedKeys: _.without(this.state.pressedKeys, key)});
  },

  pressKey: function (note) {
    var key = s11.midi.noteValue(note);
    if (_.contains(this.state.pressedKeys, key)) {
      this.keyOff(key);
    }
    else {
      this.keyOn(key);
      this.props.play(note);
    }
  },

  clearPiano: function () {
    this.setState({pressedKeys: []});
  },

  playChord: function (chord) {
    var keys;

    chord = chord.inOctave(this.props.chordOctave);
    this.clearPiano();
    keys = _.map(chord.chord, s11.midi.noteValue);
    this.props.play(chord, null, null, this.keyOn.bind(this, keys));
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
        <button onClick={this.playChord.bind(this, s11.chord.create('Cm7'))}>Play Chord</button>
      </div>
    );
  }
});
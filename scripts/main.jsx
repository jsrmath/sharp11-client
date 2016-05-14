var s11 = require('sharp11');
var _ = require('underscore');
var audio = require('./audio');
var React = require('react');
var ReactDOM = require('react-dom');
var songs = require('./songs');
var Piano = require('./Piano.jsx');

audio.init(function (play, stop) {
  ReactDOM.render(
    <Piano
      range={[s11.note.create('C3'), s11.note.create('C6')]}
      play={play}
      stop={stop}
      chordOctave={4}
      songs={songs} />,
    document.getElementById('content')
  );
});
var s11 = require('sharp11');
var jzaTools = require('sharp11-jza');
var _ = require('underscore');
var audio = require('sharp11-web-audio');
var React = require('react');
var ReactDOM = require('react-dom');
var songs = require('./songs');
var Piano = require('./Piano.jsx');
var model = require('../model.json');

audio.init(function (err, fns) {
  ReactDOM.render(
    <Piano
      range={[s11.note.create('C3'), s11.note.create('C6')]}
      play={fns.play}
      stop={fns.stop}
      defaultOctave={4}
      songs={songs}
      jza={jzaTools.load(model)} />,
    document.getElementById('content')
  );
});
var s11 = require('sharp11');
var _ = require('underscore');
var audio = require('./audio');
var React = require('react');
var ReactDOM = require('react-dom');
var Piano = require('./Piano.jsx');

audio.init(function (play, stop) {
  ReactDOM.render(
    <Piano
      range={[s11.note.create('C3'), s11.note.create('C6')]}
      play={play}
      stop={stop}
      chordOctave={4} />,
    document.getElementById('content')
  );

  // var chart = require('../node_modules/sharp11/sample/charts').myFunnyValentineFull;
  // var imp = s11.improv.create({dissonance: 0}).over('chart', chart);
  // playImprovChart(imp);
});
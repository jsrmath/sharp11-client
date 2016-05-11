var s11 = require('sharp11');
var _ = require('underscore');
var audio = require('./audio');
var React = require('react');
var ReactDOM = require('react-dom');

audio.init(function (play) {
  var playImprovChart = function (chart, settings) {
    settings = _.defaults(settings || {}, {
      tempo: 120, // BPM
      swingRatio: 1.5, // How much longer first eighth note is than second
      chordOctave: 3
    });

    // Play chords
    _.reduce(chart.chart, function (currentTime, change) {
      var changeLength = change.notes.length / settings.tempo * 60;
      play(change.chord.inOctave(settings.chordOctave), currentTime, changeLength);
      return currentTime + changeLength;
    }, 0);

    // Play notes
    _.reduce(chart.noteList, function (currentTime, note) {
      // Use the exposed noteLength function from sharp11 midi library
      var noteTicks = s11.midi.noteLength(note.duration, settings);

      // Convert ticks to seconds
      var ticksPerBeat = 96;
      var noteLength = noteTicks / ticksPerBeat / settings.tempo * 60;

      if (note.note) play(note.note, currentTime, noteLength);

      return currentTime + noteLength;
    }, 0);
  };

  ReactDOM.render(
    <h1>Hello, world!</h1>,
    document.getElementById('content')
  );

  foo();

  // var chart = require('../node_modules/sharp11/sample/charts').myFunnyValentineFull;
  // var imp = s11.improv.create({dissonance: 0}).over('chart', chart);
  // playImprovChart(imp);
});
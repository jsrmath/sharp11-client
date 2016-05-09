var s11 = require('sharp11');
var _ = require('underscore');
var loadBuffers = require('webaudio-buffer-loader');
var piano_soundfont = require('./soundfonts/acoustic_grand_piano-mp3');

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var ctx = new AudioContext();

loadBuffers(_.values(piano_soundfont), ctx, function(err, buffers) {
  if (err) alert(err);

  // Create two sources and play them both together.
  var source1 = ctx.createBufferSource();
  var source2 = ctx.createBufferSource();
  source1.buffer = buffers[10];
  source2.buffer = buffers[50];

  source1.connect(ctx.destination);
  source2.connect(ctx.destination);
  source1.noteOn(0);
  source2.noteOn(0);
});
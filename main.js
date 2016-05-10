var s11 = require('sharp11');
var _ = require('underscore');
var loadBuffers = require('webaudio-buffer-loader');

var pianoSoundfont;
if (new Audio().canPlayType('audio/ogg') !== '') {
  pianoSoundfont = require('./soundfonts/acoustic_grand_piano-ogg');
}
else {
  pianoSoundfont = require('./soundfonts/acoustic_grand_piano-mp3');
}

var scaleDelay = .5;
var defaultDuration = .3;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var ctx = new AudioContext();

loadBuffers(_.values(pianoSoundfont), ctx, function(err, buffers) {
  if (err) alert(err);

  var getBuffer = function (note) {
    note = note.clean();
    if (note.acc === '#') note = note.toggleAccidental(); // Note names are all flats

    // The soundfont is an object indexed by note, but converted to an array to load buffers
    return buffers[_.indexOf(_.keys(pianoSoundfont), note.fullName)];
  };

  var playNote = function (note, start, duration) {
    var src = ctx.createBufferSource();
    src.buffer = getBuffer(note);
    src.connect(ctx.destination);
    src.start(start);
    src.stop(duration);
  };

  var play = function (obj, start, duration) {
    start = ctx.currentTime + (start || 0);
    duration = ctx.currentTime + start + (duration || defaultDuration);

    if (s11.chord.isChord(obj)) {
      _.each(obj.chord, function (note) {
        playNote(note, start, duration);
      });
    }
    else if (s11.scale.isScale(obj)) {
      _.each(obj.scale, function (note, i) {
        playNote(note, start + i * scaleDelay, duration + i * scaleDelay);
      });
    }
    else { // Assume note
      playNote(s11.note.create(obj));
    }
  };

  play(s11.scale.create('G4', 'Mixolydian'));
});
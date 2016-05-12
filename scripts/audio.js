var s11 = require('sharp11');
var _ = require('underscore');
var loadBuffers = require('webaudio-buffer-loader');
var WAAClock = require('waaclock');

var pianoSoundfont;
if (new Audio().canPlayType('audio/ogg') !== '') {
  pianoSoundfont = require('../soundfonts/acoustic_grand_piano-ogg');
}
else {
  pianoSoundfont = require('../soundfonts/acoustic_grand_piano-mp3');
}

var scaleDelay = .5;
var defaultDuration = .3;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var ctx = new AudioContext();
var clock = new WAAClock(ctx);
clock.start();

module.exports.init = function (func) {
  loadBuffers(_.values(pianoSoundfont), ctx, function(err, buffers) {
    if (err) alert(err);

    var getBuffer = function (note) {
      note = note.clean();
      if (note.acc === '#') note = note.toggleAccidental(); // Note names are all flats

      // The soundfont is an object indexed by note, but converted to an array to load buffers
      return buffers[_.indexOf(_.keys(pianoSoundfont), note.fullName)];
    };

    var playNote = function (note, start, duration, callback) {
      var src = ctx.createBufferSource();
      var gainNode = ctx.createGain();

      src.buffer = getBuffer(note);
      src.connect(ctx.destination);
      src.start(start, 0, duration);
      if (callback) clock.callbackAtTime(callback, start);
    };

    var play = function (obj, start, duration, callback) {
      start = ctx.currentTime + (start || 0);
      duration = duration || defaultDuration;

      if (s11.chord.isChord(obj)) {
        _.each(obj.chord, function (note) {
          playNote(note, start, duration, callback);
        });
      }
      else if (s11.scale.isScale(obj)) {
        _.each(obj.scale, function (note, i) {
          playNote(note, start + i * scaleDelay, duration + i * scaleDelay, callback);
        });
      }
      else { // Assume note
        playNote(s11.note.create(obj), start, duration, callback);
      }
    };

    func(play);
  });
};
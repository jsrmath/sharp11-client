var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var del = require('del');
var babel = require('babelify');

gulp.task('build', function () {
  return browserify('./scripts/main.jsx', {debug: true})
    .transform(babel.configure({presets: ["react"]}))
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('.'));
});

gulp.task('clean', function () {
  return del(['bundle.js']);
});

gulp.task('default', ['clean', 'build']);
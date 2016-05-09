var gulp = require('gulp');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var rename = require('gulp-rename');
var del = require('del');

gulp.task('browserify', function () {
  var bundleStream = browserify('main.js').bundle();

  return bundleStream.pipe(source('main.js'))
    .pipe(streamify(uglify()))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('.'));
});

gulp.task('clean', function () {
  return del(['bundle.js']);
});

gulp.task('default', ['clean', 'browserify']);
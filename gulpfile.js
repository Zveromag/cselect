var gulp        = require('gulp');
var sass        = require('gulp-sass');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');
var autoprefix  = require('gulp-autoprefixer');
var csso        = require('gulp-csso');
var browserSync = require('browser-sync').create();

// sass
gulp.task('sass', function () {
  return gulp.src('./src/**/*.scss')
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(autoprefix({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('dist'))
    .pipe(csso())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream())
});

//js
gulp.task('js', function() {
  return gulp.src('./src/**/*.js')
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream())
});

gulp.task('sync', ['copy:css', 'copy:js'], () => {
  browserSync.init({
    server: {
      baseDir: './docs',
      index: 'index.html'
    },
    port: 8080
  });
  gulp.watch(['./src/**/*.scss'], ['copy:css']);
  gulp.watch(['./src/**/*.js'], ['copy:js']);
  gulp.watch('./docs/index.html').on('change', browserSync.reload);
});

gulp.task('copy:css', ['sass'], function() {
  return gulp.src('./dist/*.min.css')
    .pipe(gulp.dest('./docs/css'))
});

gulp.task('copy:js', ['js'], function () {
  return gulp.src('./dist/*.min.js')
    .pipe(gulp.dest('./docs/js'))
});


gulp.task('default', ['sync']);
gulp.task('build', ['sass', 'js']);

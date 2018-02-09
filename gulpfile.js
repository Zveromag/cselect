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

gulp.task('sync', ['sass'], () => {
  browserSync.init({
    server: {
      baseDir: './dist',
      index: 'demo.html'
    },
    port: 8080
  });
  gulp.watch(['./src/**/*.scss'], ['sass']);
  gulp.watch(['./src/**/*.js'], ['js']);
  gulp.watch('./dist/demo.html').on('change', browserSync.reload);
});



// gulp.task('default', function () {
//   gulp.watch('./src/**/*.scss', ['sass']);
//   gulp.watch('./src/**/*.js', ['js']);
// });
gulp.task('default', ['sync']);

var gulp = require('gulp');
var connect = require('gulp-connect');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var glslify = require('glslify');
var open = require('gulp-open');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
 

var port = 9000;

gulp.task('browserify', function() {
 
  return browserify('src/main.js')
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('js'));

});
 
gulp.task('compress', function() {

  return browserify('src/main.js')
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer()) 
    .pipe(uglify()) 
    .pipe(gulp.dest('./js'));

});

gulp.task('connect', function() {
 
  connect.server({
    root: '',
    livereload: true,
    port: port
  });

});


gulp.task('html', ['browserify'], function () {
  
  gulp.src(['*.html'])
    .pipe(connect.reload());  

});


gulp.task('watch', function () {

  gulp.watch(['src/**/*.js', 'src/**/*.vert', 'src/**/*.frag'], ['browserify', 'html']);
  gulp.watch(['*.html'], ['browserify', 'html']);

});


gulp.task('open', ['browserify', 'connect', 'watch'], function(){

  gulp.src('')
  .pipe(open({uri: 'http://localhost:' + port}));

});


gulp.task('lint', function() {
  
  return gulp.src('src/**/*.js')
    .pipe(jshint())
    // .pipe(jshint.reporter('jshint-stylish'))
    // .pipe(jshint.reporter('fail'))
    
});


gulp.task('default', ['browserify','connect', 'watch', 'lint', 'open']);

gulp.task('build', [ 'compress','connect', 'open']);

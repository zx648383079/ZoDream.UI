var gulp = require('gulp'),
    minCss = require('gulp-clean-css'),
    sass = require("gulp-sass"),
    concat = require('gulp-concat');
    rename = require('gulp-rename');
    uglify = require('gulp-uglify');
    ts = require("gulp-typescript");
 
gulp.task('sass', function () {
    return gulp.src("src/css/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("dev/css"));
});

gulp.task('cssMin', function () {
    return gulp.src("dev/css/*.css")
        .pipe(minCss())
        .pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest("prov/css"));
});

gulp.task('ts', function () {
    return gulp.src('src/js/*.ts')
    .pipe(ts({
        target: 'ES5'
    }))
    .pipe(gulp.dest('dev/js'));
});

gulp.task('jsMin', function () {
    return gulp.src("dev/js/*.js")
        .pipe(uglify())
        .pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest("prov/js"));
});

// //合并js文件
 // gulp.task('jsConcat',function(){
 //    gulp.src('prov/js/*.js')
 //        .pipe(concat('all.js'))
 //        .pipe(gulp.dest('all/js'))
 // }); 

gulp.task('default', ['sass', 'cssMin', 'ts', 'jsMin']);
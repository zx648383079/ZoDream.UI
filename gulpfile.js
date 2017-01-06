var gulp = require('gulp'),
    minCss = require('gulp-clean-css'),
    sass = require("gulp-sass"),
    ts = require("gulp-typescript");
 
gulp.task('sassMin', function () {
    return gulp.src("sass/*.scss")
        .pipe(sass())
        .pipe(minCss())
        .pipe(gulp.dest("css"));
});

gulp.task('ts', function () {
    return gulp.src('js/*.ts') // 要压缩的css文件
    .pipe(ts({
        target: 'ES5'
    }))
    .pipe(gulp.dest('js'));
});

gulp.task('default', ['sassMin', 'ts']);
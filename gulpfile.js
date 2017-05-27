var gulp = require('gulp'),
    minCss = require('gulp-clean-css'),
    sass = require("gulp-sass"),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    ts = require("gulp-typescript"),
    tslint = require("gulp-tslint"),
    tsProject = ts.createProject('tsconfig.json');
 
gulp.task('sass', function () {
    return gulp.src("src/css/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write('./'))
        //.pipe(minCss())
        //.pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest("dist/css"));
});


gulp.task('tslint', () =>
    gulp.src('src/js/*.ts')
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report())
);

gulp.task('ts', function () {
    return gulp.src('src/js/*.ts')
    .pipe(tsProject())
    //.pipe(uglify())
    //.pipe(rename({suffix:'.min'}))
    .pipe(gulp.dest('dist/js'));
});

// //合并js文件
 // gulp.task('jsConcat',function(){
 //    gulp.src('prov/js/*.js')
 //        .pipe(concat('all.js'))
 //        .pipe(gulp.dest('all/js'))
 // }); 

gulp.task('default', ['sass', 'tslint', 'ts']);
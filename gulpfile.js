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

gulp.task('dialog', function () {
    return gulp.src(['src/js/core/cache.ts', 'src/js/core/event.ts', 'src/js/core/box.ts', 'src/js/dialog/*.ts', 'src/js/dialog/type/tip.ts', 'src/js/dialog/type/message.ts', 'src/js/dialog/type/notify.ts', 
    'src/js/dialog/type/pop.ts', 
    'src/js/dialog/type/loading.ts', 
    'src/js/dialog/type/content.ts', 
    'src/js/dialog/type/box.ts',
    'src/js/dialog/type/form.ts',
    'src/js/dialog/type/page.ts',
    'src/js/dialog/type/image.ts',
    'src/js/dialog/type/disk.ts'])
    .pipe(sourcemaps.init())
    .pipe(concat('jquery.dialog.ts'))
    .pipe(tsProject())
    //.pipe(uglify())
    // .pipe(rename({suffix:'.min'}))
    //.pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('page', function () {
    return gulp.src(['src/js/core/event.ts', 
        'src/js/core/box.ts', 
        'src/js/core/uri.ts', 
        'src/js/page/jquery.page.ts'])
    .pipe(sourcemaps.init())
    .pipe(concat('jquery.page.ts'))
    .pipe(tsProject())
    //.pipe(uglify())
    //.pipe(rename({suffix:'.min'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('city', function () {
    return gulp.src(['src/js/core/cache.ts', 'src/js/core/event.ts', 'src/js/core/box.ts', 'src/js/city/jquery.city.ts'])
    .pipe(sourcemaps.init())
    .pipe(concat('jquery.city.ts'))
    .pipe(tsProject())
    //.pipe(uglify())
    //.pipe(rename({suffix:'.min'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('slider', function () {
    return gulp.src(['src/js/core/event.ts', 'src/js/slider/point.ts', 'src/js/slider/item.ts', 'src/js/slider/jquery.slider.ts'])
    .pipe(sourcemaps.init())
    .pipe(concat('jquery.slider.ts'))
    .pipe(tsProject())
    //.pipe(uglify())
    //.pipe(rename({suffix:'.min'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('date', function () {
    return gulp.src(['src/js/core/utils.ts', 'src/js/core/event.ts', 'src/js/core/box.ts', 'src/js/date/jquery.datetimer.ts'])
    .pipe(sourcemaps.init())
    .pipe(concat('jquery.datetimer.ts'))
    .pipe(tsProject())
    //.pipe(uglify())
    //.pipe(rename({suffix:'.min'}))
    //.pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('navbar', function () {
    return gulp.src(['src/js/navbar/option.ts', 
    'src/js/navbar/navItem.ts', 'src/js/navbar/tab.ts', 'src/js/navbar/jquery.navbar.ts'])
    .pipe(sourcemaps.init())
    .pipe(concat('jquery.navbar.ts'))
    .pipe(tsProject())
    //.pipe(uglify())
    //.pipe(rename({suffix:'.min'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});

// //合并js文件
 // gulp.task('jsConcat',function(){
 //    gulp.src('prov/js/*.js')
 //        .pipe(concat('all.js'))
 //        .pipe(gulp.dest('all/js'))
 // }); 

gulp.task('default', ['sass', 'tslint', 'ts']);
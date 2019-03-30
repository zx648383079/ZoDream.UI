var gulp = require('gulp'),
    minCss = require('gulp-clean-css'),
    sass = require("gulp-sass"),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    ts = require("gulp-typescript"),
    tslint = require("gulp-tslint"),
    babel = require('gulp-babel'),
    autoprefixer = require('gulp-autoprefixer'),
    tsProject = ts.createProject('tsconfig.json');

// process.argv && process.argv.length > 2 获取参数
 
function sassTask() {
    return gulp.src("src/css/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('./'))
        //.pipe(minCss())
        //.pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest("dist/css"));
}


function tslintTask() {
    return gulp.src('src/js/*.ts')
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report());
}

function tsTask() {
    return gulp.src('src/js/*.ts')
        .pipe(tsProject())
        //.pipe(uglify())
        //.pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest('dist/js'));
}

function dialogTask() {
    return gulp.src(['src/js/core/cache.ts', 'src/js/core/event.ts', 'src/js/core/box.ts', 'src/js/dialog/*.ts', 'src/js/dialog/type/tip.ts', 'src/js/dialog/type/message.ts', 'src/js/dialog/type/notify.ts', 
        'src/js/dialog/type/pop.ts', 
        'src/js/dialog/type/loading.ts', 
        'src/js/dialog/type/content.ts', 
        'src/js/dialog/type/box.ts',
        'src/js/dialog/type/form.ts',
        'src/js/dialog/type/page.ts',
        'src/js/dialog/type/image.ts',
        'src/js/dialog/type/disk.ts'])
        //.pipe(sourcemaps.init())
        .pipe(concat('jquery.dialog.ts'))
        .pipe(tsProject())
        //.pipe(uglify())
        // .pipe(rename({suffix:'.min'}))
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
}

function pageTask() {
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
}

function uploadTask() {
    return gulp.src(['src/js/core/event.ts',
        'src/js/upload/jquery.upload.ts'])
        .pipe(sourcemaps.init())
        .pipe(concat('jquery.upload.ts'))
        .pipe(tsProject())
        // .pipe(babel({
        //     presets: ['es2015']
        // }))
        //.pipe(uglify())
        //.pipe(rename({suffix:'.min'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
}

function cityTask() {
    return gulp.src(['src/js/core/cache.ts', 'src/js/core/event.ts', 'src/js/core/box.ts', 'src/js/city/jquery.city.ts'])
        .pipe(sourcemaps.init())
        .pipe(concat('jquery.city.ts'))
        .pipe(tsProject())
        //.pipe(uglify())
        //.pipe(rename({suffix:'.min'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
}

function multiSelectTask() {
    return gulp.src(['src/js/core/cache.ts', 'src/js/core/event.ts', 'src/js/select/jquery.multi-select.ts'])
        .pipe(sourcemaps.init())
        .pipe(concat('jquery.multi-select.ts'))
        .pipe(tsProject())
        //.pipe(uglify())
        //.pipe(rename({suffix:'.min'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
}

function sliderTask(params) {
    return gulp.src(['src/js/core/event.ts', 'src/js/slider/point.ts', 'src/js/slider/item.ts', 'src/js/slider/jquery.slider.ts'])
        .pipe(sourcemaps.init())
        .pipe(concat('jquery.slider.ts'))
        .pipe(tsProject())
        //.pipe(uglify())
        //.pipe(rename({suffix:'.min'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
}

function dateTask() {
    return gulp.src(['src/js/core/utils.ts', 'src/js/core/event.ts', 'src/js/core/box.ts', 'src/js/date/jquery.datetimer.ts'])
        //.pipe(sourcemaps.init())
        .pipe(concat('jquery.datetimer.ts'))
        .pipe(tsProject())
        //.pipe(uglify())
        //.pipe(rename({suffix:'.min'}))
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
}

function selectTask() {
    return gulp.src(['src/js/core/cache.ts', 'src/js/core/event.ts', 'src/js/select/jquery.selectbox.ts'])
        .pipe(sourcemaps.init())
        .pipe(concat('jquery.selectbox.ts'))
        .pipe(tsProject())
        //.pipe(uglify())
        //.pipe(rename({suffix:'.min'}))
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
}

function regionTask() {
    return gulp.src(['src/js/core/cache.ts', 'src/js/select/jquery.region.ts'])
        .pipe(sourcemaps.init())
        .pipe(concat('jquery.region.ts'))
        .pipe(tsProject())
        //.pipe(uglify())
        //.pipe(rename({suffix:'.min'}))
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
}

function filterTask() {
    return gulp.src(['src/js/core/utils.ts', 'src/js/filter/jquery.filterbox.ts'])
        .pipe(sourcemaps.init())
        .pipe(concat('jquery.filterbox.ts'))
        .pipe(tsProject())
        //.pipe(uglify())
        //.pipe(rename({suffix:'.min'}))
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
}

function navTask() {
    return gulp.src(['src/js/navbar/option.ts', 
        'src/js/navbar/navItem.ts', 'src/js/navbar/tab.ts', 'src/js/navbar/jquery.navbar.ts'])
        //.pipe(sourcemaps.init())
        .pipe(concat('jquery.navbar.ts'))
        .pipe(tsProject())
        //.pipe(uglify())
        //.pipe(rename({suffix:'.min'}))
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
}

function christmasTask() {
    return gulp.src(['src/js/core/requestAnimationFrame.ts', 'src/js/core/timer.ts', 
        'src/js/christmas/*.ts'])
        .pipe(sourcemaps.init())
        .pipe(concat('christmas.ts'))
        .pipe(tsProject())
        //.pipe(uglify())
        //.pipe(rename({suffix:'.min'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
}

function readerTask() {
    return gulp.src([
        'src/js/reader/*.ts'])
        .pipe(sourcemaps.init())
        .pipe(concat('reader.ts'))
        .pipe(tsProject())
        //.pipe(uglify())
        //.pipe(rename({suffix:'.min'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
}

exports.sassTask = sassTask;
exports.tslintTask = tslintTask;
exports.tsTask = tsTask;
exports.dialogTask = dialogTask;
exports.dateTask = dateTask;
exports.uploadTask = uploadTask;
exports.selectTask = selectTask;
exports.regionTask = regionTask;
exports.sliderTask = sliderTask;
exports.christmasTask = christmasTask;
exports.navTask = navTask;
exports.readerTask = readerTask;
exports.multiSelectTask = multiSelectTask;

var build = gulp.series(gulp.parallel(sassTask, tslintTask, tsTask));

gulp.task('dialog', gulp.series(dialogTask));
gulp.task('date', gulp.series(dateTask));
gulp.task('select', gulp.series(multiSelectTask));
gulp.task('region', gulp.series(regionTask));
gulp.task('slider', gulp.series(sliderTask));
gulp.task('upload', gulp.series(uploadTask));
gulp.task('crsms', gulp.series(christmasTask));
gulp.task('nav', gulp.series(navTask));
gulp.task('reader', gulp.series(readerTask));
gulp.task('default', build);
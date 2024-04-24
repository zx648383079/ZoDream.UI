var loader = require('gulp-vue2mini').PackLoader,
    jsDist = 'dist/js/',
    cssDist = 'dist/css/';

async function sassTask() {
    await loader.input("src/css/*.scss")
        .sass({
            sourceMap: true,
        })
        .output(cssDist);
}

async function tsTask() {
    await loader.input('src/js/*.ts')
        .ts('tsconfig.json', !loader.argv.min)
        .output(jsDist);
}

async function dialogTask() {
    await loader.input('src/js/core/cache.ts', 'src/js/core/event.ts', 'src/js/core/box.ts', 'src/js/dialog/*.ts', 'src/js/dialog/type/tip.ts', 'src/js/dialog/type/message.ts', 'src/js/dialog/type/notify.ts', 
        'src/js/dialog/type/pop.ts', 
        'src/js/dialog/type/loading.ts', 
        'src/js/dialog/type/content.ts', 
        'src/js/dialog/type/box.ts',
        'src/js/dialog/type/form.ts',
        'src/js/dialog/type/page.ts',
        'src/js/dialog/type/image.ts',
        // 'src/js/dialog/type/disk.ts'
    )
        .ts('tsconfig.json', !loader.argv.min)
        .output(jsDist + 'jquery.dialog.ts');
}

async function pageTask() {
    await loader.input('src/js/core/event.ts', 
        'src/js/core/box.ts', 
        'src/js/core/uri.ts', 
        'src/js/page/jquery.page.ts')
        .ts('tsconfig.json', !loader.argv.min)
        .output(jsDist + 'jquery.page.ts');
}

async function editorTask() {
    await loader.input('src/js/editor/modal/*.ts',
        'src/js/editor/*.ts')
        .ts('tsconfig.json', !loader.argv.min)
        .output(jsDist + 'jquery.editor.ts');
}


async function uploadTask() {
    await loader.input('src/js/core/event.ts',
        'src/js/upload/jquery.upload.ts')
        .ts('tsconfig.json', !loader.argv.min)
        .output(jsDist + 'jquery.upload.ts');
}

async function cityTask() {
    await loader.input('src/js/core/cache.ts', 'src/js/core/event.ts', 'src/js/core/box.ts', 'src/js/city/jquery.city.ts')
        .ts('tsconfig.json', !loader.argv.min)
        .output(jsDist + 'jquery.city.ts');
}

async function multiSelectTask() {
    await loader.input('src/js/core/cache.ts', 'src/js/core/event.ts', 'src/js/select/jquery.multi-select.ts')
        .ts('tsconfig.json', !loader.argv.min)
        .output(jsDist + 'jquery.multi-select.ts');
}

async function sliderTask() {
    await loader.input('src/js/core/event.ts', 'src/js/slider/point.ts', 'src/js/slider/item.ts', 'src/js/slider/jquery.slider.ts')
        .ts('tsconfig.json', !loader.argv.min)
        .output(jsDist + 'jquery.slider.ts');
}

async function dateTask() {
    await loader.input('src/js/core/utils.ts', 'src/js/core/event.ts', 'src/js/core/box.ts', 'src/js/date/jquery.datetimer.ts')
        .ts('tsconfig.json', !loader.argv.min)
        .output(jsDist + 'jquery.datetimer.ts');
}

async function selectTask() {
    await loader.input('src/js/core/cache.ts', 'src/js/core/event.ts', 'src/js/select/jquery.selectbox.ts')
        .ts('tsconfig.json', !loader.argv.min)
        .output(jsDist + 'jquery.selectbox.ts');
}

async function regionTask() {
    await loader.input('src/js/core/cache.ts', 'src/js/select/jquery.region.ts')
        .ts('tsconfig.json', !loader.argv.min)
        .output(jsDist + 'jquery.region.ts');
}

async function filterTask() {
    await loader.input('src/js/core/utils.ts', 'src/js/filter/jquery.filterbox.ts')
        .ts('tsconfig.json', !loader.argv.min)
        .output(jsDist + 'jquery.filterbox.ts');
}

async function navTask() {
    await loader.input('src/js/navbar/option.ts', 
        'src/js/navbar/navItem.ts', 'src/js/navbar/tab.ts', 'src/js/navbar/jquery.navbar.ts')
        .ts('tsconfig.json', !loader.argv.min)
        .output(jsDist + 'jquery.navbar.ts');
}

async function christmasTask() {
    await loader.input('src/js/core/requestAnimationFrame.ts', 'src/js/core/timer.ts', 
        'src/js/christmas/*.ts')
        .ts('tsconfig.json', !loader.argv.min)
        .output(jsDist + 'christmas.ts');
}

async function readerTask() {
    await loader.input('src/js/reader/*.ts')
        .ts('tsconfig.json', !loader.argv.min)
        .output(jsDist + 'reader.ts');
}

loader.task('dialog', dialogTask);
loader.task('date', dateTask);
loader.task('select', multiSelectTask);
loader.task('region', regionTask);
loader.task('slider', sliderTask);
loader.task('upload', uploadTask);
loader.task('crsms', christmasTask);
loader.task('nav', navTask);
loader.task('reader', readerTask);
loader.task('editor', editorTask);

loader.task('default', async () => {
    await sassTask(), 
    await tsTask();
});
loader.task('all', loader.series('default', 'dialog', 'date', 'select', 'region', 'slider', 'upload', 'crsms', 'nav', 'reader', 'editor'));
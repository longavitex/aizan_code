const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const pug = require("gulp-pug");
const browserSync = require("browser-sync").create();
const useref = require("gulp-useref");
const terser = require("gulp-terser");
const gulpIf = require("gulp-if");
const cssnano = require("gulp-cssnano");
const babel = require("gulp-babel");
const rename = require("gulp-rename");

const { src, watch, dest, parallel, series } = gulp;

const paths = {
    scss: "app/assets/sass/**/*.scss",
    html: "app/*.html",
    js: "app/assets/js/**/*.js",
    pug: "app/assets/pug/**/*.pug",
    images: "app/assets/images/**/*.+(png|jpg|gif|svg)",
    media: "app/assets/media/**/*.+(mp3|mp4)",
    fonts: "app/assets/fonts/**/*",
};

function style() {
    return src(paths.scss)
        .pipe(sass())
        .pipe(dest("app/assets/css"))
        .pipe(browserSync.stream());
}

function babelJs() {
    return src("app/assets/js/main.js")
        .pipe(
            babel({
                presets: ["@babel/env"],
            })
        )
        .pipe(rename("main.min.js"))
        .pipe(gulp.dest("app/assets/js"))
        .pipe(browserSync.stream());
}

function browserSyncF() {
    browserSync.init({
        server: "app",
    });
}

function pugHtml() {
    return src(paths.pug)
        .pipe(pug({ pretty: true }))
        .pipe(dest("app"))
        .pipe(browserSync.stream());
}

function browserReload() {
    return browserSync.reload;
}

function wathFiles() {
    watch(paths.scss, style);
    watch(paths.pug, pugHtml);
    watch(paths.html).on("change", browserReload());
    watch("app/assets/js/main.js", babelJs);
}

function minifySoucre() {
    return src(paths.html)
        .pipe(useref())
        .pipe(gulpIf("*.js", terser()))
        .pipe(gulpIf("*.css", cssnano()))
        .pipe(dest("dist"));
}

const watching = parallel(wathFiles, browserSyncF);
const build = series(style, pugHtml, minifySoucre);

exports.default = watching;
exports.build = build;
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

// Zadanie kompilacji SASS
gulp.task('sass', function() {
    return gulp.src('./source/css/**/*.scss')
        .pipe(sourcemaps.init()) // Inicjalizacja sourcemaps
        .pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('.')) // Zapis sourcemaps
        .pipe(gulp.dest('./public/css')) // Zapisz skompilowany plik style.css w katalogu public/css dla patternalaba
        .pipe(gulp.dest('../'));
}); 

const jsFiles = [
    './source/js/footer/global.js', 
    './source/js/footer/gallery-swiper.js', 
    './source/js/footer/accordions.js', 
    './source/js/footer/gallery-zoom.js',    
    './source/js/footer/forms.js',
    
];


// Nowe zadanie minifikacji i łączenia JS
gulp.task('concat-minify-js', function() {
    return gulp.src(jsFiles)
        // .pipe(sourcemaps.init()) // Inicjalizacja sourcemaps
        .pipe(concat('index.js')) // Łączenie plików JS
        // .pipe(uglify()) // Minifikacja
        // .pipe(sourcemaps.write('.')) // Zapis sourcemaps
        .pipe(gulp.dest('./public/js')) // Zapisz zminifikowany i połączony plik w katalogu source/js/footer dla patternalaba

});

// Zadanie obserwacji zmian
gulp.task('watch', function() {
    gulp.watch(['./source/**/*.scss', './patterns/**/*.scss'], gulp.series('sass'));
    gulp.watch('./source/js/footer/**/*.js', gulp.series('concat-minify-js')); 
});

// Zadanie domyśln
gulp.task('default', gulp.series('sass', 'concat-minify-js', 'watch'));

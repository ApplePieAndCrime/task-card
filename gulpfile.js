const { src, dest, parallel, series } = require('gulp')

//sass
const scss = require('gulp-sass')
const prefix = require('autoprefixer')
const postcss = require('gulp-postcss')
const csso = require('gulp-csso')

// sync
const watch = require('gulp-watch')
const sync = require('browser-sync').create()
const debug = require('gulp-debug')

// pug
const pug = require('gulp-pug')

// js
const babel = require('gulp-babel')

// etc
const clean = require('gulp-clean')
const sourcemaps = require('gulp-sourcemaps')
const webpack = require('webpack-stream')
const replace = require('gulp-replace')


function cleanDist() {
	return src('dist', {read: false})
				.pipe(clean())
}

function toCSS() {
	return src('dev/sass/*.sass')
				.pipe(sourcemaps.init())
				.pipe(debug({title: 'sass:'}))
				.pipe(scss())
				.pipe(postcss([prefix()]))
				//.pipe(csso())
				.pipe(sourcemaps.write())
				.pipe(dest('dist/css/'))
}

function toHTML() {
	return src(['dev/pug/*.pug','dev/pug/pages/*.pug'])
				.pipe(sourcemaps.init())
				.pipe(debug({title: 'pug:'}))
				.pipe(pug({pretty: true}))
				.pipe(sourcemaps.write())
				.pipe(replace('sass','css'))
				.pipe(dest('dist/'))
}

function babelJS() {
	return src('dev/js/**/*.js')
				.pipe(sourcemaps.init())
				.pipe(debug({title: 'js:'}))
				.pipe(babel({
					presets: ['@babel/env']
				}))
				.pipe(webpack({
					mode: "production",
					output: {
						filename: 'index.js'
					}
				}))
				.pipe(sourcemaps.write())
				.pipe(dest('dist/js'))
}

function copySrc() {
	return src('dev/static/**/*.*', {allowEmpty: true})
				.pipe(dest('dist/static/'))
}

function watchFiles() {
	watch('dev/sass/**/*.sass', toCSS)
	watch('dev/pug/**/*.pug', toHTML)
	watch('dev/js/**/*.js', babelJS)
}

function browserSync() {
	sync.init( {
		server: {
			baseDir: "./dist/"
		}
	})
	sync.watch('dist/**/*.*').on('change', sync.reload)
}

exports.build = series(cleanDist, copySrc, toCSS, toHTML, babelJS )
exports.start = series(cleanDist, copySrc, toCSS, toHTML, babelJS, parallel(watchFiles, browserSync))
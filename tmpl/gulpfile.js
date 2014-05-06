var clean = require("gulp-clean");
var gulp = require("gulp");
var hl = require("highland");
var jade = require("gulp-jade");
var less = require("gulp-less");
var markdown = require("gulp-markdown");
var moment = require("moment");
var replace = require("gulp-replace");

var essays = gulp.src("../!(tmpl|dist)/meta.json")
	.pipe(hl())
	.map(function (val) {
		var obj = JSON.parse(val.contents.toString("utf8"));
		
		obj.path = val.path.replace(/.+\/(.+)\/meta.json/, "$1");
		obj.dateStr = moment.utc(obj.date).format("dddd, MMMM Do, YYYY");
		obj.hackernews = obj.hackernews ? "http://news.ycombinator.com/item?id=" + obj.hackernews : null;
		obj.googleplus = obj.googleplus ? "https://plus.google.com/" + obj.googleplus : null;
		
		return obj;
	})
	.where(process.argv[2] ? { draft: undefined } : {})
	.collect()
	.invoke("sort", [function (a, b) {
		return a.date < b.date;
	}])
	.flatten();

gulp.task("clean", function () {
	return gulp.src("../dist/*/**", { read: false })
		.pipe(clean({ force: true }));
});

gulp.task("style", function () {
	return gulp.src("./global.less")
		.pipe(less({ compress: true }))
		.pipe(gulp.dest("../dist"));
});

gulp.task("essays", ["clean"], function () {
	return essays.fork().map(function (val) {
		return gulp.src("../" + val.path + "/essay.md")
			.pipe(markdown())
			.pipe(hl());
	}).flatten().zip(essays.fork()).map(function (val) {
		val[1].gaid = process.argv[2];
		val[1].html = val[0].contents.toString("utf8");
		
		return gulp.src("./essay.jade")
			.pipe(jade({ locals: val[1] }))
			.pipe(hl())
			.concat(gulp
				.src("../" + val[1].path + "/!(meta.json|essay.md)")
				.pipe(hl()))
			.pipe(gulp.dest("../dist/" + val[1].path));
	}).flatten();
});

gulp.task("index", function () {
	return essays.fork().collect().map(function (arr) {
		var locals = {
			list: arr,
			gaid: process.argv[2]
		};
		
		return gulp.src("./index.jade")
			.pipe(jade({ locals: locals }))
			.pipe(hl())
			.concat(gulp
				.src("./favicon.ico")
				.pipe(hl()))
			.pipe(gulp.dest("../dist"));
	}).flatten();
});

gulp.task("readme", function () {
	return essays.fork().collect().map(function (arr) {
		arr = arr.map(function (val) {
			return "* " + val.date + " \"[" + val.title + "](http://essays.tkaz.ec/" + val.path + ")\"" +
				(val.hackernews ? " - [Hacker News](" + val.hackernews + ")" : "") +
				(val.googleplus ? " - [Google+](" + val.googleplus + ")" : "");
		}).join("\n");
		
		return gulp.src("../README.md")
			.pipe(replace(/---(?:.|\s)+---/, "---\n\n" + arr + "\n\n---"))
			.pipe(gulp.dest(".."));
	}).flatten();
});

gulp.task("watch", function () {
	gulp.watch("./global.less", ["style"]);
	gulp.watch(["./global.jade", "./index.jade"], ["index"]);
	gulp.watch(["./global.jade", "./essay.jade", "../!(tmpl|dist)/*"], ["essays"]);
});

gulp.task("default", ["style", "essays", "index", "readme"]);
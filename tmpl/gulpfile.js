var clean = require("gulp-clean");
var gulp = require("gulp");
var highlight = require("highlight.js");
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
		
		obj.urls.gp = "https://plus.google.com/" + obj.urls.gp;
		obj.urls.hn = "https://news.ycombinator.com/item?id=" + obj.urls.hn;
		obj.urls.rd = "http://www.reddit.com/" + obj.urls.rd;
		obj.urls.tw = "https://twitter.com/intent/tweet" +
			"?text=" + encodeURIComponent(obj.name) +
			"&url=" + encodeURIComponent("http://essays.tkaz.ec/" + obj.path) +
			"&via=tkazec";
		
		return obj;
	})
	.where(process.env.GAID ? { draft: undefined } : {})
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
			.pipe(markdown({ highlight: function (code) {
				return highlight.highlight(val.lang, code).value;
			} }))
			.pipe(hl());
	}).flatten().zip(essays.fork()).map(function (val) {
		val[1].gaid = process.env.GAID;
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
			gaid: process.env.GAID
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
			return "* " + val.date +
				" \"[" + val.name + "](http://essays.tkaz.ec/" + val.path + ")\"" +
				" - [Google+](" + val.urls.gp + ")" +
				" - [Hacker News](" + val.urls.hn + ")" +
				" - [Reddit](" + val.urls.rd + ")" +
				" - [Twitter](" + val.urls.tw + ")";
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
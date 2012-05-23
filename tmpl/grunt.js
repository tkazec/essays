module.exports = function (grunt) { "use strict";

/*** setup ***/
var jade = require("jade"),
	marked = require("marked");

grunt.initConfig({
	clean: {
		folder: "dist"
	},
	less: {
		all: {
			src: "tmpl/global.less",
			dest: "dist/global.css",
			options: {
				compress: true
			}
		}
	},
	watch: {
		files: "./!(dist)/*",
		tasks: "default"
	}
});

grunt.loadNpmTasks("grunt-clean");
grunt.loadNpmTasks("grunt-less");

grunt.file.setBase("..");


/*** helpers ***/
grunt.registerHelper("list", function () {
	return grunt.file.expandDirs("!(tmpl|dist)").map(function (path) {
		var obj = grunt.file.readJSON(path + "meta.json");
		
		obj.name = path.replace("/", "");
		obj.day = grunt.template.date(obj.date, "UTC:dddd, mmmm dS, yyyy");
		obj.hackernews = obj.hackernews ? "http://news.ycombinator.com/item?id=" + obj.hackernews : null;
		obj.googleplus = obj.googleplus ? "https://plus.google.com/" + obj.googleplus : null;
		
		return obj;
	}).sort(function (a, b) {
		return a.date < b.date;
	});
});


/*** tasks ***/
grunt.registerTask("index", "Generates the index and copies the favicon.", function (gaid) {
	jade.renderFile("tmpl/index.jade", {
		list: grunt.helper("list"),
		gaid: gaid
	}, function (err, str) {
		err && grunt.fatal(err);
		
		grunt.file.write("dist/index.html", str);
	});
	
	grunt.file.copy("tmpl/favicon.ico", "dist/favicon.ico");
});

grunt.registerTask("essays", "Copies and generates essay files.", function (gaid) {
	grunt.helper("list").forEach(function (essay) {
		essay.gaid = gaid;
		essay.html = marked(grunt.file.read(essay.name + "/essay.md"));
		
		grunt.file.expandFiles(essay.name + "/!(meta.json|essay.md)").forEach(function (file) {
			grunt.file.copy(file, "dist/" + file);
		});
		
		jade.renderFile("tmpl/essay.jade", essay, function (err, str) {
			err && grunt.fatal(err);
			
			grunt.file.write("dist/" + essay.name + "/index.html", str);
		});
	});
});

grunt.registerTask("readme", "Generates the README.", function () {
	var list = grunt.helper("list").map(function (essay) {
		return grunt.template.process(
			"* <%=date%> \"[<%=title%>](http://essays.tkaz.ec/<%=name%>)\"" +
			(essay.hackernews ? " - [Hacker News](<%=hackernews%>)" : "") +
			(essay.googleplus ? " - [Google+](<%=googleplus%>)" : ""),
		essay);
	}).join("\n");
	
	grunt.file.write("README.md", grunt.file.read("README.md").replace(/---(?:.|\s)+---/, "---\n\n" + list + "\n\n---"));
});

grunt.registerTask("ga", "Default w/ Google Analytics.", function (gaid) {
	grunt.task.run("default", "index:" + gaid, "essays:" + gaid);
});

grunt.registerTask("default", "clean less index essays readme");

};
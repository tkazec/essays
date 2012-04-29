module.exports = function (grunt) { "use strict";

/*** setup ***/
var jade = require("./tmpl/node_modules/jade"),
	marked = require("./tmpl/node_modules/marked");

grunt.initConfig({
	meta: {
		essays: "!(tmpl|dist)",
		files: "!(meta.json|essay.md)"
	},
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


/*** helpers ***/
grunt.registerHelper("list", function () {
	return grunt.file.expandDirs(grunt.config.get("meta.essays")).map(function (path) {
		var obj = grunt.file.readJSON(path + "meta.json");
		
		obj.path = path;
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
grunt.loadTasks("tmpl/node_modules/grunt-clean/tasks");
grunt.loadTasks("tmpl/node_modules/grunt-less/tasks");

grunt.registerTask("index", "Generates the index.", function (gaid) {
	jade.renderFile("tmpl/index.jade", {
		list: grunt.helper("list"),
		gaid: gaid
	}, function (err, str) {
		err && grunt.fatal(err);
		
		grunt.file.write("dist/index.html", str);
	});
});

grunt.registerTask("essays", "Copies and generates essay files.", function (gaid) {
	grunt.helper("list").forEach(function (essay) {
		essay.gaid = gaid;
		essay.html = marked(grunt.file.read(essay.path + "essay.md"));
		
		grunt.file.expandFiles(essay.path + grunt.config.get("meta.files")).forEach(function (file) {
			grunt.file.copy(file, "dist/" + file);
		});
		
		jade.renderFile("tmpl/essay.jade", essay, function (err, str) {
			err && grunt.fatal(err);
			
			grunt.file.write("dist/" + essay.path + "index.html", str);
		});
	});
});

grunt.registerTask("readme", "Generates the README.", function () {
	
});

grunt.registerTask("ga", "Default w/ Google Analytics.", function (gaid) {
	grunt.task.run("clean less index:" + gaid + " essays:" + gaid);
});

grunt.registerTask("default", "clean less index essays");

};
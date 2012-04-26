var jade = require("jade"),
	marked = require("marked");

module.exports = function (grunt) { "use strict";

/*** config ***/
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
	}
});


/*** helpers ***/
grunt.registerHelper("list", function () {
	return grunt.file.expandDirs(grunt.config.get("meta.essays")).map(function (path) {
		var obj = grunt.file.readJSON(path + "meta.json");
		
		obj.name = path.replace("/", "");
		obj.path = path;
		obj.day = grunt.template.date(obj.date, "UTC:dddd, mmmm dS, yyyy");
		
		return obj;
	}).sort(function (a, b) {
		return a.date < b.date;
	});
});


/*** tasks ***/
grunt.loadTasks("tmpl/node_modules/grunt-clean/tasks");
grunt.loadTasks("tmpl/node_modules/grunt-less/tasks");

grunt.registerTask("index", "Generates the index", function () {
	jade.renderFile("tmpl/index.jade", {
		list: grunt.helper("list")
	}, function (err, str) {
		err && grunt.fatal(err);
		
		grunt.file.write("dist/index.html", str);
	});
});

grunt.registerTask("essays", "Copies and generates essay files", function () {
	grunt.helper("list").forEach(function (essay) {
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

grunt.registerTask("readme", "Generates the README", function () {
	
});

grunt.registerTask("default", "clean less index essays");

};
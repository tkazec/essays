I originally created [essays.tkaz.ec](http://essays.tkaz.ec) as a means to preserve my Google+ "blog posts". (Turns out that was an even better idea than I originally realized!) With comments already on Hacker News, Google+, and Twitter, I only needed a simple static website. But of course, no existing solution really fit. (Even now, there’s nothing else that even comes close to what I want.)

Around the same time, [Grunt](http://gruntjs.com) became everyone’s new favorite thing. So of course I tried it out! But even then, I didn’t like the syntax. (I promptly came up with and forgot about an idea for a Grunt wrapper that didn’t require so much boilerplate.) But ultimately Grunt worked, so I let it be.

Fast forward two (?!) years: I started a new life and realized I needed to blog about it. But Grunt seemed really unappealing. Fortunately, around the same time, [gulp.js](http://gulpjs.com) and [Highland.js](http://highlandjs.org) hit my radar. Streams! Cool! It occurred to me that these libraries would probably work well together, so I set out to figure out how. (I still don’t know of anyone else doing so.)

The [end result](https://github.com/tkazec/essays/blob/af2d3f3b2f5fe112f737063c23cc595a1c8078db/tmpl/gulpfile.js) is a weird cross between counterintuitive and elegant, unreliable and fun. I’m definitely misusing both libraries, but successfully avoiding callback hell!

### list

	var essays = gulp.src("../!(tmpl|dist)/meta.json").pipe(hl())

Not bad so far. Just a simple glob to get the essay meta files, then pipe them into Highland. There’s other ways to convert, but I chose this one for consistency.

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

Okay, cool. This converts the [vinyl](https://github.com/wearefractal/vinyl) files into objects.

	.where(process.env.GAID ? { draft: undefined } : {})

Great, draft support! Only show essays when testing.

	.collect()
	.invoke("sort", [function (a, b) {
		return a.date < b.date;
	}])
	.flatten();

HAHA WHAT?! Yeah, I just turned that Highland stream into an array, sorted it, and turned it back into a Highland stream. The end result is `essays` is a global, fully processed Highland stream that I can just `.fork()` wherever I want.

### clean

	return gulp.src("../dist/*/**", { read: false })
		.pipe(clean({ force: true }));

Nothing to look at here, except the weird-but-effective double star glob.

### style

	return gulp.src("./global.less")
		.pipe(less({ compress: true }))
		.pipe(gulp.dest("../dist"));

The LESS plugin is conveniently smart enough to figure out include paths on its own.

### essays

	return essays.fork().map(function (val) {
		return gulp.src("../" + val.path + "/essay.md")
			.pipe(markdown({ highlight: function (code) {
				return highlight.highlight(val.lang, code).value;
			} }))
			.pipe(hl());
	}).flatten()

So! Convert essay objects into their associated Markdown files, then compile them into HTML files. The `.flatten()` call ensures the returned Highland streams are properly piped back into the main Highland stream.

	.zip(essays.fork()).map(function (val) {
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

Yeah, it gets weirder. The `.zip()` call tacks a plain set of essay objects onto the compiled HTML files. Then, mapping over the results, it renders each into a final HTML file, grabs the associated asset files, and writes them to the distribution. (Using Highland, I can easily concat multiple gulp inputs and pipe them into one gulp output.) Returning and flattening everything ensures gulp knows when the processing is complete.

### index

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

Building on the same concepts as the essays task, this starts by collecting the essay objects into one array. Then it loads and renders the index HTML file, tacks on the favicon file, and writes both to the distribution.

### readme

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

Essentially the same process as the index task. This also uses the replace plugin to update the README file.

### watch

	gulp.watch("./global.less", ["style"]);
	gulp.watch(["./global.jade", "./index.jade"], ["index"]);
	gulp.watch(["./global.jade", "./essay.jade", "../!(tmpl|dist)/*"], ["essays"]);

Unfortunately the watch feature is currently effectively useless, due to the essays task being unreliable. (I don’t know why, and I don’t care enough to figure out if it’s my fault or not.)

### default

	gulp.task("default", ["style", "essays", "index", "readme"]);

짜잔! Clearly, gulp and Highland together are very powerful. I look forward to them being used as real solutions to real problems. But please don’t do what I did; they deserve more. This is just *fun*.
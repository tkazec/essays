My first project at [Buzzvil](http://www.buzzvil.com) was to develop a system to reliably render images at scale with PhantomJS. The result of my efforts was [Ghost Town: simple queued & clustered PhantomJS processing](https://www.npmjs.org/package/ghost-town) in a tiny Node.js module.

## Problem
PhantomJS is not an easy library to work with. Crashing and freezing is common. High memory usage and slow startup time is expected, and scaling must be done manually. Ultimately, [PhantomJS](http://phantomjs.org) and [phantomjs-node](https://www.npmjs.org/package/phantom) are neglected projects, so these issues can be expected to remain indefinitely.

At Buzzvil, we needed the ability to reliably render a wide variety of images, with low latency and therefore high concurrency. No existing project effectively managed this, so I researched and designed a module that could both gracefully recover from crashes and scale automatically.

## Solution
Enter Ghost Town. It does the heavy lifting of launching and managing PhantomJS and queuing and processing tasks, and then it gets out of your way to let you do the rest.

Each item is stored in the master’s queue until a worker is ready, and then assigned for processing. If the processing times out or the assigned worker fails, Ghost Town will requeue it. Reliability guaranteed!

To prevent memory leaks, Ghost Town creates separate PhantomJS processes for each worker, and periodically relaunches them based on their number of pages created.

## Implementation
Initializing Ghost Town is easy. (Several configuration options are available for tweaking the runtime and efficiency settings; [see the documentation for details](https://www.npmjs.org/package/phantom#readme).) With no configuration:

	var town = require("ghost-town")();

Next, implement the master and worker as when using the normal cluster module. Usually a simple `if (town.isMaster)` check will suffice.

	if (town.isMaster) {
		// master code
		// queue items here
	} else {
		// worker code
		// process items here
	}

The main master method is `town.queue(data, next)`, which queues an item with `data`, and calls `next(err, data)` when the item has been processed by the worker. You’re free to implement the master queuer however you like, probably using some sort of messaging system. At Buzzvil, we use [Thrift](http://thrift.apache.org). Our master starts a server, and queues render requests as it receives them:

	thrift.createServer(Renderer, {
		render: function (html, width, height, next) {
			town.queue({
				html: html,
				width: width,
				height: height
			}, function (err, data) {
				next(err, !err && new Buffer(data, "base64"));
			});
		}
	}).listen(1337);

The only worker hook is the `town!queue(page, data, next)` event. Ghost Town automatically manages everything, so `page` will always be a brand new PhantomJS page. All you need to do is configure the page, process the `data` passed from the master, and call `next(err, data)` to pass it back. At Buzzvil, we render HTML documents. Our worker configures the page (size, headers, content), and renders it to an image:

	town.on("queue", function (page, data, next) {
		// setup code
		// sequentially configure the page here
		// page.set("viewportSize", ...)
		// page.set("customHeaders", ...)
		// page.set("onLoadFinished", ...)
		// page.set("content", ...)
		
		page.renderBase64("jpeg", function (data) {
			next(null, data);
		});
	});

## Conclusion
Ghost Town has been successfully running at scale in production for over a month now, ultimately a significant improvement over our previous manual concurrency solution. Further improvements can be expected with the release of Node.js v0.12, and we hope the community benefits from our [release of Ghost Town](https://github.com/buzzvil/ghost-town) under the MIT license.

Happy coding!
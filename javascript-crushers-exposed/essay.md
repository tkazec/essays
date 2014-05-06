A few years back, when JavaScript use was first exploding and people were realizing that speed is an issue, there were two dominant categories of compression tools.

The first, minifiers like Closure Compiler, are still commonly used today. They start with simply stripping whitespace, and may shorten variables and even change code—often resulting in size reductions of 50%, without affecting evaluation.

The second are known as "crushers" or "packers", of which the leader was Dean Edward's [/packer/](http://dean.edwards.name/packer/). They analyze the code using algorithms, generating a string which is later unpacked and evaluated by a small piece of bootstrap code. Byte reduction can come close to standard tools like gzip, but at a huge initial performance hit, due to the recursive unpacking and evaluation. Because of this, with the advent of better minifiers and wider use of gzip, crushers eventually fell out of favor.

Fast forward to the latest js1k, [Love '12](http://js1k.com/2012-love/), a JavaScript demo competition where entries are no more than 1k in size and often graphical in nature. (I entered [Firehearts](http://js1k.com/2012-love/demo/1252) and wrote about the [creation process](/creating-firehearts).)

Looking over the the competition, I noticed a trend: many were using crushers, or were actually crushers themselves, since evaluation performance isn't an issue in demos. One in particular, [First Crush](http://js1k.com/2012-love/demo/1189), caught my eye, and I saw a golden opportunity—being only 1k, the process is fairly simple—to learn about and expose the black box. Enjoy :)

## 1. Analyze

The very first step is get a list of safe ASCII characters that don't already appear in the code. We'll use these later when replacing substrings.

	for (var i = 1; i < 127; ++i) {
		var chr = String.fromCharCode(i);
		
		if (!/[\r\n'"\\]/.test(chr) && code.indexOf(chr) === -1) {
			free.push(chr);
		}
	}

The core of the analyzer is actually a function, used later in the process. Essentially, it finds and counts every substring suitable to replace, ranks them based on byte savings, and returns the best.

	var search = function () {
		var strs = {};
		
		for (var sub_len = 2, sub_len_stop = sub_len_max; sub_len <= sub_len_stop; ++sub_len) {
			...
		}
		
		var best = false;
		var best_savings = 0;
		var best_count = 0;
		
		for (var sub in strs) {
			...
		}
		
		return best;
	};

The first loop finds and counts all the substrings.

	for (var sub_len = 2, sub_len_stop = sub_len_max; sub_len <= sub_len_stop; ++sub_len) {
		for (var code_pos = 0, code_pos_stop = code.length - sub_len; code_pos < code_pos_stop; ++code_pos) {
			var sub = code.substr(code_pos, sub_len);
			var last_pos = code_pos;
			
			if (!strs[sub]) {
				strs[sub] = 1;
				
				while (~(last_pos = code.indexOf(sub, last_pos + sub_len))) {
					strs[sub]++;
					sub_len_max = sub_len;
				}
			}
		}
	}

Once we have the substrings, it's just a simple matter of finding the best. To do that, we loop through all of them...

	for (var sub in strs) {
		var count = strs[sub];
		
		if (count > 1) {
			...
		}
	}

The main indicator of quality is the bytes saved, so we calculate that. Since there's no native way to check the byte length of a string in JavaScript, we use a simple trick that expands Unicode characters.

	var bytes = unescape(encodeURI(sub)).length;
	var savings = (bytes * (count - 1)) - count - 2;

Finally, if we did find the best so far, record it.

	if (savings > best_savings || (savings === best_savings && count < best_count)) {
		best_savings = savings;
		best_count = count;
		best = sub;
	}

## 2. Crush
This part is relatively simple. Each pass, it analyzes the current code and crushes a single recurring substring, then repeats the process on the result until there are no more worthwhile replacements. In this way, it's recursive—after the first pass, we're operating on already partially crushed code.

	while ((chr = free.pop()) && (substr = search())) {
		code = code.split(substr).join(chr) + chr + substr;
		used = chr + used;
	}

For future unpacking, we leave behind a copy of the original substring along with the replacement character.

## 3. Wrap up
Now that the code is fully crushed, it just needs to be packaged up. To start, we get the least used type of quote to minimize escaping in the output string:

	var quote = code.split("'").length < code.split('"').length ? "'" : '"';

Then we go ahead and escape the crushed code.

	code = code.replace(/[\r\n\\]/g, "\\$&").replace(RegExp(quote, "g"), "\\" + quote);

Next, we need a template for the output. There are other ways to do this, but the most readable is with an actual function:

	var out = function () {
		f="{code}";
		for(i in g="{used}")
			e=f.split(g[i]),
			f=e.join(e.pop());
		eval(f)
	};

And finally, we take the template, convert it to a string, strip out the bad stuff, and add in the final strings.

	return out.toString()
		.replace(/.+\{((?:.|\s)+)\}/, "$1")
		.replace(/[\t\r\n]/g, "")
		.replace(/"/g, quote)
		.split("{used}").join(used)
		.split("{code}").join(code);

Congratulations! You've created a JavaScript crusher. Take a look at the [final code](crush.js). :)

## Epilogue: Unpacking
This is where it all comes together (or apart?).

The bootstrap loops through the replacement characters, recursively unpacking the code. Each pass, it splits the crushed string on every occurance of the character, then pops the last element—which, as added during step 2, is the original substring. Then it's a simple matter of joining the array back up by that substring. This goes on until the crush characters have all been processed and the code is fully unpacked.

The code is then evaluated, and the process is complete!

## Demo
<div class="row">
	<div class="col-sm-4">
		<div class="well" style="margin-bottom:0">
			<p>Try it out! (Large scripts may take a while.)</p>
			<p><span id="demo-oldsize">0</span>B / <span id="demo-newsize">0</span>B = <span id="demo-pctsize">0.0</span>%</p>
			<button class="btn btn-block btn-primary" id="demo-run">Crush</button>
		</div>
	</div>
	<div class="col-sm-8">
		<textarea id="demo-txt" style="height:154px; margin:0; width:100%"></textarea>
	</div>
</div>

<script src="crush.js"></script>
<script src="crush-demo.js"></script>
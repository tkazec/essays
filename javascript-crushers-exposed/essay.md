A few years ago, back when JavaScript use was first exploding and everyone was realizing that speed is an issue, there were two dominant categories of compression tools.

The first, minifiers like Closure Compiler, are still commonly used today. They start with simply stripping whitespace, and may shorten variables and even change code—often resulting in size reductions of 50%, without affecting evaluation.

The second are known as "crushers" or "packers", of which the leader was Dean Edward's [/packer/](http://dean.edwards.name/packer/). They analyze the code using algorithms, generating a string which is later unpacked and evaluated by a small piece of bootstrap code. Byte reduction can come close to standard tools like gzip, but at a huge initial performance hit, due to the recursive unpacking and evaluation. Because of this, with the advent of better minifiers and wider use of gzip, crushers eventually fell out of favor.

Fast forward to the latest js1k, [Love '12](http://js1k.com/2012-love/), a JavaScript demo competition where entries are no more than 1k in size and often graphical in nature. (I entered ["Firehearts"](http://js1k.com/2012-love/demo/1252) and wrote about the [creation process](/creating-firehearts).)

Looking over the the competition, I noticed a trend: many were using crushers, or were actually crushers themselves, since evaluation performance isn't an issue in demos. One in particular, [First Crush](http://js1k.com/2012-love/demo/1189), caught my eye, and I saw a golden opportunity—being only 1k, the process is fairly simple—to learn about and expose the black box. Enjoy :)

## 1. Analyze


## 2. Crush
This part is relatively simple. One thing to note is that the algorithm is recursive: Each pass, it analyzes the current code and crushes a single recurring substring, and then repeats the process on the result until there are no more worthwhile replacements.

Selects a free character, then analyzes the code using the previously explained search function. Uses split and join to safely replace every occurrence of the selected substring with the selected character. Then, adds one final occurrence of the character and the original substring to the end of the result. Record that the character was used. Repeats until no good substrings are left to crush.

	while ((chr = free.pop()) && (substr = search(code))) {
		code = code.split(substr).join(chr) + chr + substr;
		used = chr + used;
	}

## 3. Wrap up
Now that the code is fully crushed, it just needs to be packaged up. First, we get the least used type of quote to minimize escaping in the output string:

	var quote = code.split("'").length < code.split('"').length ? "'" : '"';

Then we go ahead and escape the crushed code.

	code = code.replace(/[\r\n\\]/g, "\\$&").replace(RegExp(quote, "g"), "\\" + quote);

Next, we need a template for the output. There are multiple ways to do this, but the most readable is with an actual function:

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

Congratulations! You've created a JavaScript crusher. Take a look at the [final code](crush.js).

## Epilogue: Unpacking
This is where it all comes together (or apart?).

The bootstrap loops through each crush character, recursively unpacking the code. It simply splits the crushed code on every occurrence of the crush character, then **pops the last substring from the array**. This substring contains the original code from that crushing pass. Then, it just joins the array back up by the original code. This process is then repeated until the crush characters have been processed and the code is fully unpacked.

The bootstrap then evaluates the code, and the process is complete!
var crush = function (code) {
	/*** Step 1: Analyze ***/
	var M = code.length / 2;
	var free = [];
	
	// Get all safe ASCII characters that aren't already used in the code.
	for (var i = 1; i < 127; ++i) {
		var chr = String.fromCharCode(i);
		
		if (!/[\r\n'"\\]/.test(chr) && !~code.indexOf(chr)) {
			free.push(chr);
		}
	}
	
	// Searches the code for the best possible replacement.
	var search = function (i) {
		var best = false;
		var strs = {};
		var best_savings = 0;
		var best_count = 0;
		
		// get every possible substring?
		for (var y = 2, z = M; y <= z; ++y) {
			for (h = 0, l = i.length - y; h < l; ++h) {
				if (!strs[e = i.substr(h, y)]) {
					for (strs[e] = 1, f = h; ~(f = i.indexOf(e, f + y)); ) {
						strs[e]++;
						M = y;
					}
				}
			}
		}
		
		// Sort the substrings.
		for (var sub in strs) {
			var count = strs[sub];
			
			if (count > 1) {
				// Get the actual size of the substring.
				var bytes = unescape(encodeURI(sub)).length;
				// Get the numbers of bytes that could be saved.
				var savings = (bytes * (count - 1)) - count - 2;
				
				// If the savings are better than any previous substring, update the best.
				if (savings > best_savings || (savings === best_savings && count < best_count)) {
					best_savings = savings;
					best_count = count;
					best = sub;
				}
			}
		}
		
		// Return the best substring we can replace.
		return best;
	};
	
	
	/*** Step 2: Crush ***/
	var used = "";
	var chr;
	var substr;
	
	// While we still have free characters and worthwhile replacements...
	while ((chr = free.pop()) && (substr = search(code))) {
		// Replace substrings with single characters, and leave behind a copy of the original.
		code = code.split(substr).join(chr) + chr + substr;
		used = chr + used;
	}
	
	
	/*** Step 3: Wrap up ***/
	// Get the least used type of quote to minimize escaping in the output string.
	var quote = code.split("'").length < code.split('"').length ? "'" : '"';
	
	// Escape the crushed code.
	code = code.replace(/[\r\n\\]/g, "\\$&").replace(RegExp(quote, "g"), "\\" + quote);
	
	// Create the output template with actual code.
	var out = function () {
		f="{code}";
		for(i in g="{used}")
			e=f.split(g[i]),
			f=e.join(e.pop());
		eval(f)
	};
	
	// Convert the output template to a string, replace bits accordingly, and return the final code.
	return out.toString()
		.replace(/.+\{((?:.|\s)+)\}/, "$1")
		.replace(/[\t\r\n]/g, "")
		.replace(/"/g, quote)
		.split("{used}").join(used)
		.split("{code}").join(code);
};
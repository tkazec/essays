var crush = function (code) {
	/*** Step 1: Analyze ***/
	var sub_len_max = code.length / 2;
	var free = [];
	
	// Get a list of safe ASCII characters that don't already appear in the code.
	for (var i = 1; i < 127; ++i) {
		var chr = String.fromCharCode(i);
		
		if (!/[\r\n'"\\]/.test(chr) && code.indexOf(chr) === -1) {
			free.push(chr);
		}
	}
	
	// Searches the code for the best possible replacement.
	var search = function () {
		var strs = {};
		
		// Get every possible substring. The main loop increments the size of the substrings to find.
		// It starts at 2, because we can't use any smaller than that. It stops at sub_len_max, because we
		// can't use anything larger than that.
		for (var sub_len = 2, sub_len_stop = sub_len_max; sub_len <= sub_len_stop; ++sub_len) {
			// This loop gets and counts every substring of length sub_len in the code.
			// q: why < and not <=?
			for (var code_pos = 0, code_pos_stop = code.length - sub_len; code_pos < code_pos_stop; ++code_pos) {
				var sub = code.substr(code_pos, sub_len);
				var last_pos = code_pos;
				
				// Make sure this is the first time we've found the substring.
				if (!strs[sub]) {
					strs[sub] = 1;
					
					// Count the instances in the code, using a "hopping" method.
					// Starts from code_pos, then hops along using last_pos.
					// Ends when it is no longer found.
					// Also sets the max substring length once it's done. Since code_pos goes up from 0,
					// this will end up being the longest substring. So don't check for longer later.
					while (~(last_pos = code.indexOf(sub, last_pos + sub_len))) {
						strs[sub]++;
						sub_len_max = sub_len;
					}
				}
			}
		}
		
		// Find the best substring.
		var best = false;
		var best_savings = 0;
		var best_count = 0;
		
		for (var sub in strs) {
			var count = strs[sub];
			
			if (count > 1) {
				// Get the actual size of the substring.
				var bytes = unescape(encodeURI(sub)).length;
				// Get the numbers of bytes that could be saved.
				var savings = (bytes * (count - 1)) - count - 2;
				
				// If the savings are better than any previous substring, update the best.
				// q: why is a lower count better?
				if (savings > best_savings || (savings === best_savings && count < best_count)) {
					best_savings = savings;
					best_count = count;
					best = sub;
				}
			}
		}
		
		return best;
	};
	
	
	/*** Step 2: Crush ***/
	var used = "";
	var chr;
	var substr;
	
	// While we still have free characters and worthwhile replacements...
	while ((chr = free.pop()) && (substr = search())) {
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
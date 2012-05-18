var crush = function (code) {
	/*** setup ***/
	var M = code.length / 2;
	
	// Searches the input string for the best possible replacement
	var search = function (i) {
		g = t = u = 0, v = {};
		
		for (y = 2, z = M; y <= z; ++y) {
			for (h = 0, l = i.length - y; h < l; ++h) {
				if (!v[e = i.substr(h, y)]) {
					for (v[e] = 1, f = h; ~(f = i.indexOf(e, f + y)); ) {
						v[e]++;
						M = y;
					}
				}
			}
		}
		
		for (e in v) {
			if ( (j = v[e]) > 1) {
				s = G(e) * (j - 1) - j - 2;
				if (s > t || (s == t && j < u) ) {
					t = s;
					u = j;
					g = e;
				}
			}
		}
		
		return g;
	};
	
	
	/*** Step 1: Analyze ***/
	var free = [];
	
	// Get all the characters in the character code range 1-127 that don't appear in str and aren't line breaks
	for (var i = 1; i < 127; ++i) {
		var char = String.fromCharCode(i);
		
		if (!/[\r\n'"\\]/.test(char) && !~code.indexOf(char)) {
			free.push(char);
		}
	}
	
	// Arrange characters so that control characters come last
	free.sort(function(i, j) {
		return i > j ? 1 : (i < j ? -1 : 0);
	});
	
	
	/*** Step 2: Crush ***/
	var used = "", char, substr;
	
	// Replace substrings with single characters while we still have free characters and worthwhile replacements
	while ( (char = free.pop()) && (substr = search(code)) ) {
		code = code.split(substr).join(char) + char + substr;
		used = char + used;
	}
	
	
	/*** Step 3: Wrap up ***/
	// Get the most popular type of quote to minimize escaping in the output string
	var quote = code.split("'").length < code.split('"').length ? "'" : '"';
	
	// Create the output template, using actual code
	var out = function () {
		f="{code}";
		for(i in g="{used}")
			e=f.split(g[i]),
			f=e.join(e.pop());
		eval(f)
	};
	
	// Properly escape the crushed code
	code = code.replace(/[\r\n\\]/g, "\\$&").replace(RegExp(quote, "g"), "\\" + quote);
	
	// Convert the output template to a string, replace bits accordingly, and return the final code
	return out.toString()
		.replace(/.+\{((?:.|\s)+)\}/, "$1")
		.replace(/[\t\r\n]/g, "")
		.replace(/"/g, quote)
		.split("{used}").join(used)
		.split("{code}").join(code);
};
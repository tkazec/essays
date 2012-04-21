var crush = function (code) {
	var M = code.length / 2;
	
	// Searches the input string for the best possible replacement
	var B = function (i) {
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
		
		X = g;
	};
	
	// Get all the characters in the character code range 1-127 that don't appear in str and aren't line breaks
	var free = [];
	for (d = 1; d < 127; ++d) {
		e = String.fromCharCode(d);
		if (!/[\r\n'"\\]/.test(e) && !~code.indexOf(e)) {
			free.push(e);
		}
	}
	
	// Arrange characters so that control characters come last
	free.sort(function(i, j) {
		return i > j ? 1 : i < j ? -1 : 0;
	});
	
	Z = "";
	
	// Replace substrings with single characters while we still have free characters and worthwhile replacements
	while ( (Y = free.pop()) && (B(code), X) ) {
		code = code.split(X).join(Y) + Y + X;
		Z = Y + Z;
	}
	
	// Get the most popular type of quote to minimize escaping in the output string
	var quote = code.split("'").length < code.split('"').length ? "'" : '"';
	
	// Create the output
	return "f=" + quote + code.replace(/[\r\n\\]/g, "\\$&").replace(RegExp(quote, "g"), "\\" + quote) + quote + ";for(i in g=" + quote + Z + quote + ")e=f.split(g[i]),f=e.join(e.pop());eval(f)";
};
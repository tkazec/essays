var txt = document.getElementById("demo-txt");
var oldsize = document.getElementById("demo-oldsize");
var newsize = document.getElementById("demo-newsize");
var pctsize = document.getElementById("demo-pctsize");

document.getElementById("demo-run").addEventListener("click", function () {
	oldsize.innerHTML = unescape(encodeURI(txt.value)).length;
	
	txt.value = crush(txt.value);
	
	newsize.innerHTML = unescape(encodeURI(txt.value)).length;
	
	pctsize.innerHTML = (((newsize.innerHTML - oldsize.innerHTML) / oldsize.innerHTML) * 100).toFixed(1);
}, false);
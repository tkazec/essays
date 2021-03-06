*[js1k](http://js1k.com/) is a competition to create cool demos in no more than 1024 bytes of JavaScript. This essay is about how I created my entry for their Love 2012 contest. [Check it out](http://js1k.com/2012-love/demo/1252)!*

For a while I’d been wanting to enter a js1k competition, but could never think of a good demo idea. However, when their latest one was announced with the theme of “Love”, I remembered something else I’d been wanting to do for a while—fireworks in JavaScript. Adding a love component was an obvious step and so, having decided, I started work on it.

### Base
Fortunately for me, back in summer 2011, jsdo.it hosted a [fireworks competition](http://jsdo.it/event/html5hanabi) and kindly provided a very nice sample. I took that and proceeded to pull out various unnecessary and/or unused components, including the DOM stuff, the tiny requestAnimationFrame() shim, and the firework settings (which I then hardcoded). This ended up reducing the unminified character count from about [4k to 1k](https://github.com/tkazec/demos/blob/2dba610b9b8ae847f0eb58d9014ecaf17c02fa84/2012-love.js).

### Hearts
Now I had a nice base, but all it generated was boring normal fireworks. Time for some hearts! Not satisfied with the normal unicode ones, I found a nice design in [another entry](http://js1k.com/2012-love/demo/1047). After pulling out some unnecessary code and adding scaling, it was a drop in replacement for the circles.

### Tweaks
What followed was quite a lot of fiddling around and experimenting. One of the hardest parts of development was figuring out the burst queuing, but I eventually figured out a nice and simple solution. I also ended up re-adding the tiny rAF() shim once I realized I had enough space left. While not entirely necessary, it provided a major increase in smoothness.

### Randomness
Lacking much space for sequencing or interactivity, adding randomness was an affordable way to make the fireworks prettier and more interesting. Almost every variable is randomized to some degree, including the colors which are taken from a list of 6 simple “love”-y hues.

### Minification
I’d already had some previous experience with minifying small JavaScript demos; back in 2010 I wrote a fully-featured [tower defense game](http://canvas-td.tkaz.ec) for 10k Apart, which took a day or so to barely scrape under the 10240 byte limit. Fortunately with Firehearts I was able to run Closure Compiler in advanced mode, which has a lot of tricks up its sleeves and can actually rewrite code. Combined with aliasing the most used math functions, it ended up being relatively easy to get down to 1009 bytes (was 1285 before math aliasing).

### Crushing
That was all a month or so ago, now back to the present. A couple days ago, I found out how effective “crushers”—programs that perform magic on your code, turning it into an ultracompressed string that is later eval()’d—really are: [First Crush](http://js1k.com/2012-love/demo/1189) immediately saved around 200 bytes, with no changes required.

### Interactivity
Once I realized how much available space there suddenly was, I decided to add some interactivity, something I’d been wanting to do but previously had no room for. Adding click-to-burst was simple, as it only required adding an onclick handler and duplicating the random burst code (crushers love repetition). Adding the meta-heart sequence was actually rather complicated: not only was the shape and look hard to figure out, but the code was pretty tricky to reduce.

### Result
Check out the code on [GitHub](https://github.com/tkazec/demos)! I’m pretty happy with the way it all turned out. Some more interactivity (enter some text to display a sequence? record custom sequences?) would have been nice, but clearly impossible with the 1k limit. Maybe for something else…

<div class="images">
	<img src="screenshot-1.png" style="height:150px">
	<img src="screenshot-2.png" style="height:150px">
	<img src="screenshot-3.png" style="height:150px">
</div>
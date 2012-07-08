A few years ago, back when JavaScript use was first exploding and people were recognizing that speed is an issue, there were two dominant compression strategies.

The first, minifiers like Closure Compiler, are still commonly used today. They start with simply stripping whitespace, and may shorten variables and even change code. They often result byte reductions of up to 50%, without changing the actual behavior.

The second are known as "crushers" or "packers", of which the leader was Dean Edward's /packer/. They analyze the code using algorithms, and then generate a string along with a small amount of bootstrap code, which unpacks and evals the string. Byte reduction performance can come close to popular algorithms like gzip, but at huge initial performance reduction, as the code must be unpacked with a loop, and then evaluated. Due to this, crushers fell out of favor with the advent of better minifiers and greater use of gzip.

### js1k

Fast forward to the beginning of 2012. A new js1k competition was announced, with the theme being love. js1k is a competition to create the coolest demo in no more than 1k of pure JavaScript. Canvas hooks are also provided, so demos are usually graphical and often interactive.

I had never entered a js1k before due to a lack of ideas, but there was another project I'd been wanting to do: Fireworks in JavaScript. Realizing that the two could be combined, I set out and created Firehearts.

I finished the first version the "normal" way—optimally structuring it, hand-aliasing common methods, and running it through Closure Compiler in advanced mode. This worked well, and I was able to get it down to 1009 bytes, with no interactivity.

However, after looking around at the other entries (all 9001 of them), I realized that many of them were using crushers to great effect. Some of them were actually just crushers themselves.

One of them, First Crush, is the topic of this essay.

## 1. Analyze

## 2. Crush

## 3. Wrap up
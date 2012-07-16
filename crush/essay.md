A few years ago, back when JavaScript use was first exploding and everyone was realizing that speed is an issue, there were two dominant categories of compression tools.

The first, minifiers like Closure Compiler, are still commonly used today. They start with simply stripping whitespace, and may shorten variables and even change code—often resulting in size reductions of 50%, without affecting evaluation.

The second are known as "crushers" or "packers", of which the leader was Dean Edward's [/packer/](http://dean.edwards.name/packer/). They analyze the code using algorithms, generating a string which is later unpacked and evaluated by a small piece of bootstrap code. Byte reduction can come close to standard tools like gzip, but at a huge initial performance hit, due to the recursive unpacking and evaluation. Because of this, with the advent of better minifiers and wider use of gzip, crushers eventually fell out of favor.

Fast forward to the latest js1k, [Love '12](http://js1k.com/2012-love/), a JavaScript demo competition where entries are no more than 1k in size and often graphical in nature. (I entered ["Firehearts"](http://js1k.com/2012-love/demo/1252) and wrote about the [creation process](/creating-firehearts).)

Looking over the the competition, I noticed a trend: many were using crushers, or were actually crushers themselves, since evaluation performance isn't an issue in demos. One in particular, [First Crush](http://js1k.com/2012-love/demo/1189), caught my eye, and I saw a golden opportunity—being only 1k, the process is fairly simple—to learn about and expose the black box. Enjoy :)

## 1. Analyze

## 2. Crush

## 3. Wrap up

## Unpacking
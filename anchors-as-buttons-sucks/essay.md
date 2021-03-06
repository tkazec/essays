So let’s say you’re an awesome web developer making an awesome web app. One day, you add a link in the web app that has an event handler instead of an href. Testing it, you realize that your cursor doesn’t change when hovering over it, unlike a normal link. You think for a minute and then give it a cursor:pointer style, which fixes the issue. You are happy.

The next day, QA informs you that the link cannot be tabbed to. Confused, you do some research and find a solution to the problem: Simply set the tabindex attribute to 0, which correctly adds the link into the tab flow. You are annoyed by the extra clutter, but otherwise happy.

The next day, QA lets you know that after focusing the link, pressing enter doesn’t do anything. You read the spec a bit closer and realize that tabindex does not give elements activation behaviors, which are required to make pressing enter register as a click. You are annoyed.

The next day, you do a lot of research, and find a few solutions to the problem:

1. Use `cursor:pointer` + `tabindex="0"` + keypress handlers along with your click handlers.
2. Set `href="#"`, and ignore that hovering over it shows the URL bar and clicking on it adds to the browser history and causes the page to go back up to the top.
3. Set `href="javascript:void(0)"` or `href="javascript:{}"` (anything that returns undefined) and get ridiculed by your peers, plus that annoying URL bar and possible incompatibilities.
4. Change all your anchors to buttons and give them a nice class which completely reskins them to look like anchors using lots of complicated, unreliable, browser-specific CSS.

Soon after finishing your research, you receive some design changes from your boss. They add a lot of those links that act like buttons.

You proceed to ragequit your job, move to India, and become a monk.

You are happy.

<div class="thumbnail"><img src="wat.jpg" width="720" height="480"></div>

*Fortunately it seems that buttons can contain block-level content, like anchors can in HTML5.*

*This research was prompted by some discussion in a Bootstrap [pull request](https://github.com/twitter/bootstrap/pull/1447) and then attempts to solve the problem in some personal projects. I have not succeeded. If anyone knows of a good solution, you get +9001 internets and the knowledge that you may have prevented a murderous rampage.*
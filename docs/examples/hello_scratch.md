# Hello Scratch
### Output
![Hello World Program Player](./hello_scratch_player.gif)
### hello_scratch.sw
```js
import "text" as text;
import "color" as color;
import "graphics" as graphics;
import "window" as window;

function frame(delta_time, events) {
    // clear the screen
    graphics.fill_rgb(2,8,16);

    // draw our text
    pen_up();
    set_pen_color(color.WHITE);
    set_pen_size(4);
    let x = 0;
    let y = 0 + 12 * sin(timer() * 60);
    let size = 24;
    // the soft preset is good for large, moving text
    text.soft("Hello Scratch", x,y,size);
}

window.start(frame);
```
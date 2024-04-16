# Hello Scratch
### Output
![Hello World Program Player](./hello_scratch_player.gif)
### hello_scratch.sw
```js
import "text" as text;
import "color" as color;
import "graphics" as graphics;

function frame() {
    // clear the screen
    graphics.fill_rgb(2,8,16);

    // draw "hello world"
    set_pen_color(color.WHITE);
    set_pen_size(4);
    let x = 0;
    let y = 0 + 12 * sin(timer() * 60);
    text.draw(
        "Hello Scratch",
        x, y,
        text.CENTER, text.CENTER,
        24, 1
    );
}

while(true) {
    frame();
}
```
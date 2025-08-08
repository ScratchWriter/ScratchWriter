# Text
```js
import "text" as text;

// anchor constants
text.CENTER;
text.LEFT;
text.RIGHT;
text.TOP;
text.BOTTOM;

// anti aliasing constants
text.edges.SHARP;
text.edges.SOFT;

// presets
text.regular(str, x,y, size);
text.italic(str, x,y, size);
text.soft(str, x,y, size);

// custom style
text.styled(
    str,                            // string to draw
    x,y,                            // position
    anchor_x, anchor_y,             // anchor point (text.CENTER, text.LEFT, text.RIGHT)
    size,                           // pixels
    spacing,                        // 1 = normal spacing
    edges,                          // text.edges.SHARP / text.edges.SOFT
    slant                           // 0 = no slant
);                                  // returns width

// pen size and color are never set by this module
pen_up();
set_pen_size(2);
set_pen_color(0);
text.draw(
    "hello world",  // text
    0,              // x
    0,              // y
    text.CENTER,    // X anchor
    text.CENTER,    // Y anchor
    12,             // size
    1,              // spacing
);
// text.draw is deprecated, prefer using text.styled or text.normal

// returns the expected width of printed text in pixels
// drawing functions also return the width
text.string_width(str, size, spacing);
```
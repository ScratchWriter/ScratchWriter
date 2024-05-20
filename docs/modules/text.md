# Text
```js
import "text" as text;

text.CENTER;
text.LEFT;
text.RIGHT;
text.TOP;
text.BOTTOM;

text.draw(
    "hello world",  // text
    0,              // x
    0,              // y
    text.CENTER,    // X anchor
    text.CENTER,    // Y anchor
    12,             // size
    1,              // spacing
);
// returns: width of the text drawn
```
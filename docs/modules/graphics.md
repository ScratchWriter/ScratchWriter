# Graphics
```js
import "graphics" as gfx;

gfx.reset();

// fills the window with the current color
gfx.fill();

// fills the window with a given rgb color
gfx.fill_rgb(255, 255, 255);

// draws a simple line
gfx.line(x1, y1, x2, y2);
// draws a line, clipped to the window
gfx.line_clipped(x1, y1, x2, y2, pen_size);

// draws a solid circle
gfx.fill_circle(x, y, radius);
// draws the outline of a circle
gfx.outline_circle(x, y, radius, stepsize, min_steps);

// efficiently fills all rows of pixels between two y coordinates
gfx.fill_rows(y1, y2);
// efficiently fills all columns of pixels between two x coordinates
gfx.fill_cols(y1, y2);

// outlines a rectangle
gfx.outline_rect(x1, x2, y1, y2);
// efficiently fills a rectangle
gfx.fill_rect(x1, x2, y1, y2);
// alternative call for fill_rect
gfx.fill_rect_at(x, y, width, height);

// efficiently fills a triangle (where res = the pen size)
gfx.fill_triangle(ax, ay, bx, by, cx, cy, res);
```
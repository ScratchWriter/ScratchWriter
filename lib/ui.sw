import "text" as text;
import "window" as window;

function button(str, x,y, anchor_x, anchor_y, font_size, spacing, text_color, hover_color, events) {
    let scale = font_size/text.LINE_HEIGHT;
    let width = text.load_string(str) * scale * spacing;

    let left = x - (width * anchor_x);
    let bottom = y - (font_size * anchor_y);
    let right = left + width;
    let top = bottom + font_size;

    let hover;
    let click;
    if (
        get_mouse_x() > left &&
        get_mouse_x() < right &&
        get_mouse_y() > bottom &&
        get_mouse_y() < top
    ) {
        hover = true;
        set_pen_color(hover_color);
    } else {
        hover = false;
        set_pen_color(text_color);
    }

    if (hover && events.mouse_pressed) {
        click = true;
    } else {
        click = false;
    }

    text.draw_string(left, bottom, scale, spacing);
    return click;
}
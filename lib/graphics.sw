import "window" as window;
import "color" as color;
import "math" as math;

function reset() {
    pen_clear();
    pen_up();
    hide();
    goto(0,0);
    set_pen_color(0);
}

function fill() {
    pen_up();
    goto(0,0);
    set_pen_size(window.DIAGONAL);
    pen_down();
    pen_up();
}

function fill_rgb(r,g,b) {
    set_pen_color(color.rgb(r,g,b));
    fill();
}

function line(x1, y1, x2, y2) {
    pen_up();
    goto(x1, y1);
    pen_down();
    goto(x2, y2);
}

function fill_circle(x,y,radius) {
    pen_up();
    goto(x,y);
    set_pen_size(radius*2);
    pen_down();
    pen_up();
}

function outline_circle(x,y, radius, stepsize, min_steps) {
    let circumference = math.TAU * radius;
    let steps = (circumference / stepsize);
    if (steps < min_steps) {
        steps = min_steps;
    }
    let delta_theta = 360/steps;
    let theta = 0;
    pen_up();
    repeat(steps) {
        goto(cos(theta) * radius, sin(theta) * radius);
        pen_down();
        theta += delta_theta;
    }
    goto(radius, 0);
}

function v_line(x) {
    pen_up();
    goto(x, window.MIN_Y);
    pen_down();
    set_y(window.MAX_Y);
}

function h_line(y) {
    pen_up();
    goto(window.MIN_X, y);
    pen_down();
    set_x(window.MAX_X);
}

function fill_cols(x1, x2) {
    pen_up();
    let center = (x1 + x2) / 2;
    set_pen_size(abs(x2-x1));
    goto(center, window.MIN_Y);
    pen_down();
    set_y(window.MAX_Y);
}

function fill_rows(y1, y2) {
    pen_up();
    let center = (y1 + y2) / 2;
    set_pen_size(abs(y2-y1));
    goto(window.MIN_X, center);
    pen_down();
    set_x(window.MAX_X);
}

function outline_rect(x1, x2, y1, y2) {
    pen_up();
    goto(x1, y1);
    pen_down();
    goto(x1, y2);
    goto(x2, y2);
    goto(x2, y1);
    goto(x1, y1);
}

function fill_rect(x1, x2, y1, y2) {
    pen_up();

    let min_x;
    let max_x;
    let min_y;
    let max_y;

    if (x1 < x2) {
        min_x = x1;
        max_x = x2;
    } else {
        min_x = x2;
        max_x = x1;
    }

    if (y1 < y2) {
        min_y = y1;
        max_y = y2;
    } else {
        min_y = y2;
        max_y = y1;
    }

    let dx = max_x - min_x;
    let dy = max_y - min_y;
    let cx = (x1+x2)/2;
    let cy = (y1+y2)/2;
    
    let r;
    if (dx < dy) {
        r = dx/2;
        set_pen_size(dx);
        goto(cx, min_y+r);
        pen_down();
        set_y(max_y-r);
    } else {
        r = dy/2;
        set_pen_size(dy);
        goto(min_x+r, cy);
        pen_down();
        set_x(max_x-r);
    }

    until (r < 1) {
        set_pen_size(r/2);
        r = r/4;
        goto(max_x - r, max_y - r);
        goto(min_x + r, max_y - r);
        goto(min_x + r, min_y + r);
        goto(max_x - r, min_y + r);
        goto(max_x - r, max_y - r);
    }
}

function fill_rect_at(x,y, w,h) {
    let w2 = w/2;
    let h2 = h/2;
    fill_rect(x-w2, x+w2, y-h2, y+h2);
}

// adapted from https://scratch.mit.edu/projects/24828481
function fill_triangle(ax, ay, bx, by, cx, cy, res) {
    pen_up();
    let td;
    let lena = sqrt((bx-cx)*(bx-cx)+(by-cy)*(by-cy));
    let lenb = sqrt((ax-cx)*(ax-cx)+(ay-cy)*(ay-cy));
    let lenc = sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by));
    let peri = 1/(lena+lenb+lenc);
    let ix = peri * (lena * ax + lenb * bx + lenc * cx);
    let iy = peri * (lena * ay + lenb * by + lenc * cy);
    let ind = sqrt(peri * ((lenb+lenc-lena)*(lenc+lena-lenb)*(lena+lenb-lenc)));
    let aox = ix - ax;
    let aoy = iy - ay;
    let box = ix - bx;
    let boy = iy - by;
    let cox = ix - cx;
    let coy = iy - cy;
    if (lena < lenb && lena < lenc) {
        td = sqrt(aox*aox+aoy*aoy);
    } else {
        if (lenb > lena || lenb > lenc) {
            td = sqrt(cox*cox+coy*coy);
        } else {
            td = sqrt(box*box+boy*boy);
        }
    }
    let rate = (2*td - ind) / (td*4);
    td = 1;
    goto(round(ix), round(iy));
    set_pen_size(ind);
    pen_down();
    repeat(ceil(log(res/ind)/log(rate))) {
        td = td * rate;
        set_pen_size(ind * td);
        goto(aox*td + ax, aoy * td + ay);
        goto(box*td + bx, boy * td + by);
        goto(cox*td + cx, coy * td + cy);
        goto(aox*td + ax, aoy * td + ay);
    }
    set_pen_size(res);
    goto(ax, ay);
    goto(bx, by);
    goto(cx, cy);
    goto(ax, ay);
    pen_up();
}

let reg1x; let reg1y;
let reg2x; let reg2y;

function swap() {
    let tx1 = reg1x;
    let tx2 = reg2x;
    reg1x = reg1y;
    reg2x = reg2y;
    reg1y = tx1;
    reg2y = tx2;
}

function clipto(threshold, side) {
    let dx = reg2x-reg1x;
    let dy = reg2y-reg1y;
    let m = dx/dy;
    let b = reg1x-(m*reg1y);

    let out = 0;
    const V1 = 1;
    const V2 = 10;

    if (side*(reg1y-threshold)>0) {
        out += V1;
    }

    if (side*(reg2y-threshold)>0) {
        out += V2;
    }

    if (out == 11) {
        return 0;
    }

    if (out == 0) {
        return 1;
    }

    if (out == V1) {
        reg1x = m*threshold+b;
        reg1y = threshold;
        return 1;
    }
    
    if (out == V2) {
        reg2x = m*threshold+b;
        reg2y = threshold;
        return 1;
    }

    return 0;
}

function line_clipped(x1,y1,x2,y2, size) {
    let r = size/2;
    reg1x = x1;
    reg1y = y1;
    reg2x = x2;
    reg2y = y2;

    if (clipto(window.MAX_Y+r, 1) == 0) {
        return;
    }
    if (clipto(window.MIN_Y-r, -1) == 0) {
        return;
    }

    swap();

    if (clipto(window.MAX_X+r, 1) == 0) {
        return;
    }
    if (clipto(window.MIN_X-r, -1) == 0) {
        return;
    }

    swap();

    pen_up();
    set_pen_size(size);
    goto(reg1x, reg1y);
    pen_down();
    goto(reg2x, reg2y);
}
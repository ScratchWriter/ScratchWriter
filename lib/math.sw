const PI = 3.14159265359;
const TAU = 6.28318530718;
const E = 2.71828182845;
const INFINITY = "Infinity";
const NEGATIVE_INFINITY = "-Infinity";
const NaN = "NaN";

function min(a, b) {
    if (a<b) {
        return a;
    } else {
        return b;
    }
}

function max(a, b) {
    if (a>b) {
        return a;
    } else {
        return b;
    }
}

function clamp(x, min_x, max_x) {
    if (x < min_x) {
        return min_x;
    }
    if (x > max_x) {
        return max_x;
    }
    return x;
}

function is_finite(x) {
    return (1 * x) == x && !(x == INFINITY || x == NEGATIVE_INFINITY);
}

function is_number(x) {
    return ((1 * x) == x);
}

function pow(base, exponent) {
    return pow_e(exponent * ln(base));
}

function hypot(a,b) {
    return sqrt(a*a + b*b);
}

function hypot3(x1,x2,x3) {
    return sqrt(x1*x1 + x2*x2 + x3*x3);
}

function to_rad(deg) {
    return 0.01745329251 * deg;
}

function to_deg(rad) {
    return 57.2957795131 * rad;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function round_to_places(x, places) {
    let shift = pow_10(places);
    return round(x*shift)/shift;
}

function atan2(x,y) {
    return atan(y/(x+0))+(180*(x<0));
}

function rotate_x1(x1, x2, deg) {
    return x1*cos(deg) - x2*sin(deg);
}

function rotate_x2(x1, x2, deg) {
    return x1*sin(deg) + x2*cos(deg);
}
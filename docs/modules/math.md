# Math
```js
import "math" as math;

math.PI;
math.TAU;
math.E;
math.INFINITY;
math.NEGATIVE_INFINITY;
math.NaN;
let min = math.min(a,b);
let max = math.max(a,b);
let x = math.clamp(number, min, max);
let y = math.pow(base, exponent);
let c = math.hypot(a,b);
let rad = math.to_rad(deg);
let deg = math.to_deg(rad);
let bool = math.is_finite(math.INFINITY); // false
let string = math.round_to_places(math.PI, 2); // 3.14

// rotation
let x = math.rotate_x1(x, y, deg);
let y = math.rotate_x2(x, y, deg);
```
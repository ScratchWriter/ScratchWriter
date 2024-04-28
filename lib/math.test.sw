import "expect" as expect;
import "math" as math;

expect.equal(math.is_finite(1), true, @);
expect.equal(math.is_finite(""), false, @);
expect.equal(round(math.pow(5, 2.5)), 56, @);
expect.equal(math.round_to_places(2.55555, 3), 2.556, @);
expect.equal(math.hypot(2,2), sqrt(8), @);
expect.equal(math.min(-5,5), -5, @);
expect.equal(math.max(-5,5), 5, @);

expect.pass(@f);
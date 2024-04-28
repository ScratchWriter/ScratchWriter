import "expect" as expect;
import "color" as color;

expect.equal(color.rgb(0,0,0), 0, @);
expect.equal(color.rgb(255,255,255), color.WHITE, @);
expect.equal(color.rgb(255,0,0), color.RED, @);
expect.equal(color.rgb(0,255,0), color.GREEN, @);
expect.equal(color.rgb(0,0,255), color.BLUE, @);
expect.equal(color.rgb(0,0,-256), 0, @);
expect.equal(color.rgb(0.1,0.1,0.1), 0, @);
expect.equal(color.rgba(0,0,0,0), 0, @);

expect.pass(@f);
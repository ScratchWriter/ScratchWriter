# Math
```js
import "expect" as expect;

// @ automatically contains a string reffering to it's own location in the source
expect.equal(1, 1, @);
expect.gt(2, 1, @);
expect.gt(1, 2, @);
```
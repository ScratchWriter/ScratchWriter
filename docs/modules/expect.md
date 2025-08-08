# Expect
```js
import "expect" as expect;

// @ contains a string reffering to it's own location in the source
expect.equal(1, 1, @);
expect.gt(2, 1, @);
expect.lt(1, 2, @);
expect.list_equal([1,2,3], [1,2,3], @);
```
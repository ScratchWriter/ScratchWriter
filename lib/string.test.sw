import "expect" as expect;
import "string" as string;

expect.equal(string.pad_end("a", 5, "."), "a....", @);
const parts = [];
let str = "hello world";
string.split(str, " ", parts);
expect.list_equal(parts, ["hello", "world"], @);
expect.equal(string.substring("abcdefg", 3, 3), "d", @);
expect.equal(string.substring("abcdefg", 3, -1), "defg", @);
expect.equal(string.insert("aaaa", 2, "b"), "aabaa", @);
expect.equal(string.replace_char("aaaa", 2, "b"), "aaba", @);

expect.pass(@f);
import "list" as list;
import "expect" as expect;

const filter_data = [1,2,3,4,5];

function is_greater_than_3(x) {
    return x > 3;
}

list.filter(filter_data, is_greater_than_3);

expect.equal(filter_data[0], 4, @);
expect.equal(filter_data[1], 5, @);

const sort_data = [1,6,2,4,3,5];
const sort_expect = [1,2,3,4,5,6];
list.sort(sort_data);

let i = 0;
repeat(sort_data.length()) {
    expect.equal(sort_data[i], sort_expect[i], @);
    i += 1;
}

expect.pass(@f);
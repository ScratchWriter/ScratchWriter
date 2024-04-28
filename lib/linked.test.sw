import "expect" as expect;
import "linked" as linked;

const DATA = [5,4,3,2,1];
linked.new(1);

let head = linked.from_list(DATA);
let tail = linked.tail_of(head);
const result = [];
linked.to_list(head, result);
expect.list_equal(result, DATA, @);

let head2 = linked.new(0);
linked.push(head2, 1);
linked.push(head2, 2);
let tail2 = linked.push(head2, 3);
expect.equal(linked.get(head2), 0, @);
expect.equal(linked.get(tail2), 3, @);
expect.equal(linked.get(linked.tail_of(head2)), 3, @);

let second = linked.next[head];
linked.insert(second, 0);
expect.equal(linked.get(linked.after(second)), 0, @);
expect.equal(linked.get(linked.after(linked.after(second))), 3, @);

let i = 0;
function count(value) {
    i += 1;
}
linked.for_each(head, count);
expect.equal(i, 6, @);

linked.delete(head);
expect.equal(linked.get(head), linked.NULL, @);

expect.pass(@f);
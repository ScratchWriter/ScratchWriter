# Linked Lists

```js
import "linked" as linked;

const DATA = [5,3,2,1];
let head = linked.from_list(DATA);
linked.to_list(head, result);
linked.push(head, 0);
linked.insert(linked.after(head), 4);

const result = [];
linked.to_list(head, result);
linked.to_string(head); // "[5,4,3,2,1,0]"

let head2 = linked.new(0);
linked.push(head2, 1);
linked.push(head2, 2);
linked.push(head2, 3);
linked.get(linked.tail_of(head2)); // 3
linked.to_string(head2); // "[0,1,2,3]"
```
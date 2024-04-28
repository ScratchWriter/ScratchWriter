import "list" as list;

const NULL = null;

const values = [];
const next = [];

function ptr(id) {
    let idx = 0;
    if (id < 0) {
        until (values[idx] == NULL || idx == values.length()) {
            idx += 1;
        }
    } else {
        idx = id;
    }

    let n = idx + 1;
    list.grow(values, n, NULL);
    list.grow(next, n, NULL);

    return idx;
}

function new(value) {
    let idx = ptr(-1);
    values[idx] = value;
    next[idx] = NULL;
    return idx;
}

function nullify(node) {
    values[node] = NULL;
    next[node] = NULL;
}

function set(id, value) {
    let idx = ptr(id);
    values[idx] = value;
    return idx;
}

function get(id) {
    return values[id];
}

function after(id) {
    return next[id];
}

function tail_of(node) {
    let id = node;
    until (next[id] == NULL) {
        id = next[id];
    }
    return id;
}

function push(to, value) {
    let node = new(value);
    next[tail_of(to)] = node;
    return node;
}

function insert(after, value) {
    let next_node = next[after];
    let node = new(value);
    next[after] = node;
    next[node] = next_node;
    return node;
}

function unlink_after(node) {
    let node_to_unlink = next[node];
    let next_node = next[node_to_unlink];
    next[node] = next_node;

    values[node_to_unlink] = NULL;
    next[node_to_unlink] = NULL;
}

function unlink(node) {
    let id = 0;
    repeat(next.length()) {
        if (next[id] == node) {
            unlink_after(id);
        }
        id += 1;
    }
}

function for_each(head, callback) {
    let node = head;
    until (node == NULL) {
        callback(values[node]);
        node = next[node];
    }
}

function to_list(head, list) {
    let node = head;
    until (node == NULL) {
        list.push(values[node]);
        node = next[node];
    }
}

function from_list(list) {
    let i = 0;
    let head = new(list[i]);
    i += 1;
    repeat(list.length()-1) {
        push(head, list[i]);
        i += 1;
    }
    return head;
}

function get_node(head, n) {
    let node = head;
    repeat (n) {
        node = next[node];
    }
    return node;
}

function delete(head) {
    let node = head;
    until (node == NULL) {
        values[node] = NULL;
        next[node] = NULL;
        node = next[node];
    }
}

function to_string(head) {
    let buff = "[";
    let node = head;
    until (node == NULL) {
        let item = values[node];
        if ((1*item) != item) {
            item = "\"" # item # "\"";
        }
        buff = buff # item;
        node = next[node];
        if (node != NULL) {
            buff = buff # ",";
        }
    }
    return buff # "]";
}
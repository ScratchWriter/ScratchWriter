function copy(from, to) {
    to.reset();
    let n = 0;
    repeat(from.length()) {
        to.push(from.item(n));
        n += 1;
    }
}

function join(from, delim) {
    if (from.length() == 0) {
        return "";
    }
    let buff = from.item(0);
    if (from.length() == 1) {
        return buff;
    }
    let n = 1;
    repeat(from.length()-1) {
        buff = buff # delim # from.item(n);
        n += 1;
    }
    buff = buff # from.item(n);
    return buff;
}

function grow(list, size, zero) {
    if (list.length() < size) {
        repeat(size - list.length()) {
            list.push(zero);
        }
    }
}

function pop(list) {
    if (list.length() < 1) {
        return false;
    }
    let tmp = list[list.length()-1];
    list.delete(list.length()-1);
    return tmp;
}

function shift(list) {
    if (list.length() < 1) {
        return false;
    }
    let tmp = list[0];
    list.delete(0);
    return tmp;
}

function to_string(list) {
    return "[" # join(list, ", ") # "]";
}
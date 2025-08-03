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

function set_safe(list, index, value) {
    grow(list, index, "");
    list[index] = value;
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

function top(list) {
    return list[list.length()-1];
}

function set_top(list, value) {
    list[list.length()-1] = value;
}

function to_string(from) {
    if (from.length() == 0) {
        return "[]";
    }

    function item(n) {
        let x = from.item(n);
        if (x == null) {
            return "null";
        }
        if ((1*x) != x) {
            x = "\"" # x # "\"";
        }
        return x;
    }

    let buff = item(0);
    if (from.length() == 1) {
        return "[" # buff # "]";
    }
    let n = 1;
    repeat(from.length()-1) {
        buff = buff # "," # item(n);
        n += 1;
    }
    return "[" # buff # "]";
}

function for_each(list, callback) {
    let i = 0;
    repeat(list.length()) {
        callback(list[i]);
        i += 1;
    }
}

function filter(list, callback) {
    let i = 0;
    repeat(list.length()) {
        if (!callback(list[i])) {
            list.delete(i);
            i += -1;
        }
        i += 1;
    }
}

function compare_numbers(a, b) {
    return a - b;
}

function sort(list) {
    sort_by(list, compare_numbers);
}

function sort_by(list, compare) {
    function _swap(arr, index1, index2) {
        let temp = arr[index1];
        arr[index1] = arr[index2];
        arr[index2] = temp;
    }

    function _quicksort_partition_and_recurse(arr, low, high, compare, current_i, current_j, pivot_val) {
        if (!(current_j < high)) {
            _swap(arr, current_i + 1, high);

            let pivotIndex = current_i + 1;

            _quicksort_recursive(arr, low, pivotIndex - 1, compare);
            _quicksort_recursive(arr, pivotIndex + 1, high, compare);
            return;
        }

        if (!(compare(arr[current_j], pivot_val) > 0)) {
            _swap(arr, current_i + 1, current_j);
            _quicksort_partition_and_recurse(arr, low, high, compare, current_i + 1, current_j + 1, pivot_val);
        } else {
            _quicksort_partition_and_recurse(arr, low, high, compare, current_i, current_j + 1, pivot_val);
        }
    }

    function _quicksort_recursive(arr, low, high, compare) {
        if (!(low < high)) {
            return;
        }

        let pivot_val = arr[high];

        _quicksort_partition_and_recurse(arr, low, high, compare, low - 1, low, pivot_val);
    }

    _quicksort_recursive(list, 0, list.length() - 1, compare);
}
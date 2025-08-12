let worker = null;
let handler = null;

function is_main() {
    return worker == null;
}

function spawn_as(callback, id) {
    as_clone {
        if (handler == callback._) {
            callback();
            delete_clone();
        }
    }

    worker = id;
    handler = callback._;
    clone();
    worker = null;
    handler = null;
    return id;
}

let counter = 0;
function spawn(callback) {
    counter += 1;
    return spawn_as(callback, counter);
}
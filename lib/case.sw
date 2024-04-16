import "assets/ABCDEFGHIJKLMNOPQRSTUVWXYZ.svg" as detector;
import "assets/no_image.svg" as base;
import "list" as list;

let caps;
let size;
const letters_caps = [];
const letters_lower = [];
function load() {
    caps = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    size = len(caps);
    list.copy(
        ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
        letters_caps
    );
    list.copy(
        ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
        letters_lower
    );
}
load();

function is_caps_fast(char) {
    if (!str_contains(caps, char)) {
        return false;
    }
    let buff = "";
    let i = 0;
    repeat(size) {
        let comp = letterof(i, caps);
        if (comp == char) {
            buff = buff # char;
        } else {
            buff = buff # comp;
        }
        i += 1;
    }
    set_costume(base);
    set_costume(buff);
    return get_active_costume() == detector;
}

function is_caps(str) {
    let preserve_costume = get_active_costume();
    let result = "true";
    let i = 0;
    repeat(len(str)) {
        result = result && is_caps_fast(letterof(i, str));
        i += 1;
    }
    set_costume(preserve_costume);
    return result;
}

function to_caps_char(char) {
    if (!str_contains(caps, char)) {
        return char;
    }
    return letters_caps[letters_caps.indexof(char)];
}

function to_lower_char(char) {
    if (!str_contains(caps, char)) {
        return char;
    }
    return letters_lower[letters_lower.indexof(char)]; 
}

function to_caps(str) {
    let buff = "";
    let i = 0;
    repeat(len(str)) {
        buff = buff # to_caps_char(letterof(i, str));
        i += 1;
    }
    return buff;
}

function to_lower(str) {
    let buff = "";
    let i = 0;
    repeat(len(str)) {
        buff = buff # to_lower_char(letterof(i, str));
        i += 1;
    }
    return buff;
}
import "string" as string;

import "assets/ABCDEFGHIJKLMNOPQRSTUVWXYZ.svg" as detector;
import "assets/no_image.svg" as base;
import "list" as list;

let caps = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let lower = "abcdefghijklmnopqrstuvwxyz";
let size = len(caps);
const letters_caps = [];
string.split(caps, "", letters_caps);
const letters_lower = [];
string.split(lower, "", letters_lower);

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
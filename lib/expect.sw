import "error" as error;
import "console" as console;
import "color" as color;

function equal(a,b, label) {
    if (a != b) {
        error.crash("Expected " # a # " == " # b, label);
    }
}

function not_equal(a,b, label) {
    if (a == b) {
        error.crash("Expected " # a # " == " # b, label);
    }
}

function gt(a,b, label) {
    if (!(a > b)) {
        error.crash("Expected " # a # " > " # b, label);
    }
}

function lt(a,b, label) {
    if (!(a < b)) {
        error.crash("Expected " # a # " < " # b, label);
    }
}

function list_equal(list1, list2, label) {
    if (list1.length() != list2.length()) {
        error.crash("Lists are not the same length.", label);
    }
    let i = 0;
    repeat(list1.length()) {
        let a = list1[i];
        let b = list2[i];
        if (a != b) {
            error.crash("Expected item " # i # ": " # a # " == " # b, label);
        }
        i += 1;
    }
}

function pass(label) {
    console.write("All tests passing for " # label);
    console.text_color = color.WHITE;
    console.background_color = color.DARK_GREEN;
    no_refresh {
        console.draw();
    }
}
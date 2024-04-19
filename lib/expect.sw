import "error" as error;

function equal(a,b, label) {
    if (!(a == b)) {
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
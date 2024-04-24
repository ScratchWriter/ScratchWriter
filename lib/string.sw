function split(str, delim, into) {
    let buff = "";
    let n = 0;

    if (delim == "") {
        repeat (len(str)) {
            into.push(letterof(n, str));
            n += 1;
        }
    }

    repeat (len(str)) {
        let c = letterof(n, str);
        if (c == delim) {
            into.push(buff);
            buff = "";
        } else {
            buff = buff#c;
        }
        n += 1;
    }
    if (len(buff) > 0) {
        into.push(buff);
    }
}

function pad_start(str, size, char) {
    let buff = str;
    forever {
        if (len(buff) < size) {
            buff = char # buff;
        } else {
            return buff;
        }
    }
}

function pad_end(str, size, char) {
    let buff = str;
    forever {
        if (len(buff) < size) {
            buff = buff # char;
        } else {
            return buff;
        }
    }
}

function pad_center(str, size, char) {
    let buff = str;
    let side = 0;
    forever {
        if (len(buff) < size) {
            if (side == 0) {
                buff = buff # char;
                side = 1;
            } else {
                buff = char # buff;
                side = 0;
            }
        } else {
            return buff;
        }
    }
}

function substring(str, start, end) {
    let buff = "";
    let i = start % len(str);
    repeat((end % len(str)) - i) {
        buff = buff # letterof(i, str);
    }
    return buff;
}

function insert(base_str, at, str) {
    return 
        substring(base_str, 0, at) #
        str #
        substring(base_str, at, -1)
        ;
}

function replace_char(str, at, with) {
    if (at > len(str)) {
        return str # with;
    }
    return
        substring(str, 0, at) #
        with #
        substring(str, at + 1, -1)
        ;
}
function split(str, delim, into) {
    let buff = "";
    let n = 0;

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
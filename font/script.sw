import "list" as list;
import "string" as string;

const data = [];
const indices = [%indices];
let caps_offset = 26;

function load() {
    const parts = [
%fontdata
    ];

    let n = 0;

    data.reset();
    repeat(parts.length()) {
        string.split(parts.item(n), ",", data);
        n += 1;
    }
    parts.reset();
}
load();
import "console" as console;
import "color" as color;

function crash(msg, label) {
    write(msg, label);
    draw_crash();
}

function draw_crash() {
    console.text_color = color.WHITE;
    console.background_color = color.RED;
    no_refresh {
        console.draw();
    }
    stop;
}

function write(msg, label) {
    console.text_color = color.WHITE;
    console.background_color = color.RED;
    console.write("");
    console.write("ERROR: " # msg);
    console.write(" - " # label);
}
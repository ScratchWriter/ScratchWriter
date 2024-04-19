import "console" as console;
import "color" as color;

function crash(msg, label) {
    console.text_color = color.WHITE;
    console.background_color = color.RED;
    console.write("");
    console.write("ERROR: " # msg);
    console.write(" - " # label);
    console.draw();
    stop;
}

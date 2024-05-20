# Window
```js
import "window" as window;

window.WIDTH;
window.HEIGHT;
window.ASPECT;
window.DIAGONAL;
window.MIN_X;
window.MAX_X;
window.MIN_Y;
window.MAX_Y;

function frame(delta_time, events) {
    // see "events" module
}

// window.double_buffer = false
window.start(frame);

window.is_visable(0,0,0); // true
window.is_visable(1000,0,0); // false
```
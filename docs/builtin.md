# Builtin Functions & Blocks

Motion
```js
goto(x, y);
set_angle(deg);
move_steps(steps);
turn_right_deg(deg);
turn_left_deg(deg);
glide_to(x, y, secs);
set_x(x);
change_x(dx);
set_y(y);
change_y(dy);
dont_rotate();
normal_rotation();
x = get_x();
y = get_y();
deg = get_direction();
```

Looks
```js
say_for_seconds();
set_size(size);
change_size(size);
show();
hide();
size = get_size();
set_costume(costume);
name = get_active_costume();
number = get_costume_number();
```

Sound
```js
play_sound(sound);
play_sound_wait(sound);
clear_sound_effects();
set_pan(pan);
set_volume(volume);
set_pitch(pitch);
volume = get_volume();
```

Control
```js
wait(secs);
```

Sensing
```js
disable_drag();
enable_drag();
bool = key_down(key);
answer = ask(prompt);
bool = get_mouse_down();
x = get_mouse_x();
y = get_mouse_y();
secs = timer();
reset_timer();
```

Operators
```js
m = floor(n);
m = ceil(n);
m = abs(n);
m = sin(n);
m = cos(n);
m = tan(n);
m = asin(n);
m = acos(n);
m = atan(n);
m = ln(n);
m = pow_e(n);
m = pow_10(n);
m = round(n);
random = randint(from, to);
n = len(string);
bool = str_contains(str, substr);
```

Pen
```js
pen_down();
pen_up();
set_pen_size(size);
set_pen_color(color);
pen_clear();
pen_stamp();
```
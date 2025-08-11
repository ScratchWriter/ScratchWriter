# Experimental Features
Most of the functionality documented here is considered unstable to use directly. Modules often provide safer ways to use this functionality.

### Clones
```js
as_clone {
    say("hi");
    delete_clone();
}
clone();
```

### Stage Lists & Variables
```js
// variables
let my_value = 0;
global our_value = 1;
// lists
const my_list = [];
global our_list = [];
```

### Broadcasts
```js
// MUST BE A STRING
when_broadcast "event" {
    say("hi");
}
// can be anything
broadcast("event");
```
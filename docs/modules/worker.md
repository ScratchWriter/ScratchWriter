# Worker
```js
import "worker" as worker;

let worker_x; let worker_y;
function my_worker() {
    goto(worker_x, worker_y);
    say("I am at (" # worker_x # ", " # worker_y # ")");
    wait(2); // prevent our worker for being deleted right away
}

// helper function for creating new workers
function create_my_worker(x,y) {
    worker_x = x;
    worker_y = y;
    worker.spawn(my_worker);
}

// start creating workers
forever {
    create_my_worker(randint(-100, 100), randint(-100,100));
    wait(0.5);
}
```
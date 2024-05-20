# Error
Basic Error Handling

### Basic Usage
```js
import "error" as error;

// Print an error message and location to the console and stop the program
error.crash("Something went wrong!", @); // the special symbol "@" gives us the location of this line
```
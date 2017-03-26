# neopixel-simulator
Simulates a neopixel strip in javascript for quick prototyping.

## Installation
1. Clone repository
2. `npm install`
3. `npm start`
4. Visit `http://localhost:8080` to view the test pattern

## Write your own patterns!
Modify the code in `index.js` to quickly prototype your Neopixel patterns
without compiling and uploading to an Arduino board. It's pretty close to
real Arduino C syntax, so it's easily portable to the real hardware.

## Arduino runtime simulator
The Arduino constructor takes two functions: `begin` and `loop`. 
`begin` is called once when the Arduino runtimes starts. `loop` is called
continuously. Unlike javascript, Arduino is synchronous and you call `delay`
to sleep between loop executions. In javascript, you need to use the `await` keyword
and the `delay` function on the Arduino runtime object.


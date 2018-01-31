# nodemark
A modern benchmarking library for Node.js

## Installation
```
npm install --save-dev nodemark
```

## Usage
```js
const benchmark = require('nodemark');

const results = benchmark(myFunction, setupFunction);
console.log(results); // => 14,114,886 ops/sec ±0.58% (7906233 samples)
```

## Statistical significance

When doing any measurement it's important to only respect statistically significant results. Thankfully, `nodemark` does many things to make this easy:

* The margin of error is calculated for you.
* The benchmarker ignores samples taken before v8 has a chance to optimize things ([JIT](https://en.wikipedia.org/wiki/Just-in-time_compilation)).
* The noise caused by running the benchmarker is factored out of the results.

The combination of these things makes it a highly accurate measuring device. However, any benchmark done in JavaScript has its limits. If the average time measured by a benchmark is too small to be reliable (< 5ns), the results will be returned as `NaN` in order to avoid giving misleading information.

# API

## benchmark(*subject*, [*setup*], [*duration*]) -> *BenchmarkResult*

Runs a benchmark measuring the performance of the `subject` function. If a `setup` function is provided, it is invoked before every iteration of `subject`.

By default the benchmark runs for about 3 seconds, but this can be overridden by passing a `duration` number (in milliseconds). Regardless of the desired duration, the benchmark will not finish until the `subject` has been run at least 10 times.

Both `subject` and `setup` can run asynchronously by declaring a callback argument in their signatures. If you do this, you must invoke the callback to indicate that the operation is complete. When running an asyncronous benchmark, this function returns a promise. However, because the `subject` and `setup` functions use callbacks rather than promises, synchronous errors will not automatically be caught.

```js
benchmark(callback => fs.readFile('foo.txt', callback))
  .then(console.log);
```

> There is no plan to support promises in `subject` and `setup` because it would cause too much overhead and yield inaccurate results.

## class *BenchmarkResult*

An immutable object representing the result of a benchmark. It has five properties:

* `mean`, the average measured time in nanoseconds
* `error`, the margin of error as a ratio of the mean
* `max`, the fastest measured time in nanoseconds
* `min`, the slowest measured time in nanoseconds
* `count`, the number of times the subject was invoked and measured

### .nanoseconds([*precision*]) -> *number*

### .microseconds([*precision*]) -> *number*

### .milliseconds([*precision*]) -> *number*

### .seconds([*precision*]) -> *number*

Returns the average measured time, rounded to the nearest whole number or the number or decimal places specified by `precision`.

### .hz([*precision*]) -> *number*

Returns the average number of executions per second, rounded to the nearest whole number or the number of decimal places specified by `precision`.

### .sd([*precision*]) -> *number*

Returns the standard deviation in nanoseconds, rounded to the nearest whole number or the number of decimal places specified by `precision`.

### .toString([*format*]) -> *number*

Returns a nicely formatted string describing the result of the benchmark. By default the `"hz"` format is used (displaying ops/sec), but you can optionally specify `"nanoseconds"`, `"microseconds"`, `"milliseconds"`, or `"seconds"` to change the information returned.

## License

[MIT](https://github.com/JoshuaWise/nodemark/blob/master/LICENSE)

# nodemark [![Build Status](https://travis-ci.org/JoshuaWise/nodemark.svg?branch=master)](https://travis-ci.org/JoshuaWise/nodemark)
A modern benchmarking library for Node.js, capable of generating statistically significant results.

## Installation
```
npm install --save-dev nodemark
```

## Usage
```js
const benchmark = require('nodemark');

const result = benchmark(myFunction, setupFunction);
console.log(result); // => 14,114,886 ops/sec ±0.58% (7906233 samples)
console.log(result.nanoseconds()); // => 71
```

## Statistical Significance

In benchmarking, it's important to generate statistically significant results. Thankfully, `nodemark` makes this easy:

* The *margin of error* is calculated for you.
* The noise caused by `nodemark` is factored out of the results.
* The garbage collector is manipulated to prevent early runs from having an unfair advantage.
* Executions done before v8 has a chance to optimize things ([JIT](https://en.wikipedia.org/wiki/Just-in-time_compilation)) are ignored.

The combination of these things makes it a highly accurate measuring device. However, any benchmark done in JavaScript has its limits. If the average time measured by a benchmark is too small to be reliable (< 10ns), the results will be `NaN` in order to avoid providing misleading information.

# API

## benchmark(*subject*, [*setup*, [*duration*]]) -> *benchmarkResult*

Runs a new benchmark. This measures the performance of the `subject` function. If a `setup` function is provided, it will be invoked before every execution of `subject`.

By default, the benchmark runs for about 3 seconds, but this can be overridden by passing a `duration` number (in milliseconds). Regardless of the desired duration, the benchmark will not finish until the `subject` has been run at least 10 times.

Both `subject` and `setup` can run asynchronously by declaring a callback argument in their signature. If you do this, you must invoke the callback to indicate that the operation is complete. When running an asyncronous benchmark, this function returns a promise. However, because `subject` and `setup` use callbacks rather than promises, synchronous errors will not automatically be caught.

```js
benchmark(callback => fs.readFile('foo.txt', callback))
  .then(console.log);
```

> There is no plan to support promises in `subject` and `setup` because it would cause too much overhead and yield inaccurate results.

## class *BenchmarkResult*

Each benchmark returns an immutable object describing the result of that benchmark. It has five properties:

* `mean`, the average measured time in nanoseconds
* `error`, the margin of error as a ratio of the mean
* `max`, the fastest measured time in nanoseconds
* `min`, the slowest measured time in nanoseconds
* `count`, the number of times the subject was invoked and measured

### .nanoseconds([*precision*]) -> *number*

Returns `this.mean`, rounded to the nearest whole number or the number or decimal places specified by `precision`.

### .microseconds([*precision*]) -> *number*

Same as [.nanoseconds()](#nanosecondsprecision---number), but the value is in microseconds.

### .milliseconds([*precision*]) -> *number*

Same as [.nanoseconds()](#nanosecondsprecision---number), but the value is in milliseconds.

### .seconds([*precision*]) -> *number*

Same as [.nanoseconds()](#nanosecondsprecision---number), but the value is in seconds.

### .hz([*precision*]) -> *number*

Returns the average number of executions per second, rounded to the nearest whole number or the number of decimal places specified by `precision`.

### .sd([*precision*]) -> *number*

Returns the standard deviation in nanoseconds, rounded to the nearest whole number or the number of decimal places specified by `precision`.

### .toString([*format*]) -> *number*

Returns a nicely formatted string describing the result of the benchmark. By default, the `"hz"` format is used, which displays ops/sec, but you can optionally specify `"nanoseconds"`, `"microseconds"`, `"milliseconds"`, or `"seconds"` to change the displayed information.

## License

[MIT](https://github.com/JoshuaWise/nodemark/blob/master/LICENSE)

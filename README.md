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
console.log(results);
// => 14,114,886 ops/sec ±0.58% (7906233 samples)
```

# API

## benchmark(*subject*, [*setup*], [*duration*]) -> *BenchmarkResult*

Runs a benchmark measuring the performance of the `subject` function. If a `setup` function is provided, it is invoked before every iteration of `subject`.

By default the benchmark runs for about 3 seconds, but this can be overridden by passing a `duration` number (in milliseconds). Regardless of the desired duration, the benchmark will not finish until the `subject` has been run at least 10 times.

Both `subject` and `setup` can run asynchronously by declaring a callback argument in their signatures. If you do this, you must invoke the callback to indicate that the operation is complete.

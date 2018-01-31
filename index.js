'use strict';
const Result = require('./lib/result');
const clean = require('./lib/clean');
const async = require('./lib/async');
const sync = require('./lib/sync');

const makeAsync = fn => cb => { fn(); cb(); };
const noopSync = () => {};
const noopAsync = cb => { cb(); };

module.exports = (fn, setup, duration) => {
	if (typeof fn !== 'function') throw new TypeError('Expected benchmark subject to be a function');
	if (setup == null) setup = fn.length ? noopAsync : noopSync;
	if (duration == null) duration = 3000;
	if (typeof setup !== 'function') throw new TypeError('Expected benchmark setup to be a function');
	if (!Number.isInteger(duration)) throw new TypeError('Expected benchmark duration to be an integer');
	if (!fn.length && setup.length) fn = makeAsync(fn);
	if (!setup.length && fn.length) setup = makeAsync(setup);
	
	// Benchmark the benchmarker, so we can factor it out later.
	const noop = fn.length ? noopAsync : noopSync;
	const noise = benchmark(noop, noop, Math.min(Math.round(duration / 10), 300));
	
	// Then run the actual benchmark.
	if (!fn.length) return benchmark(fn, setup, duration, noise);
	return noise.then(noise => benchmark(fn, setup, duration, noise));
};

const benchmark = (fn, setup, duration, noise) => {
	if (!fn.length) return new Result(clean(sync(fn, setup, duration), noise));
	let callback;
	const promise = new Promise((resolve, reject) => { callback =
		(err, samples) => err ? reject(err) : resolve(new Result(clean(samples, noise))); });
	async(fn, setup, duration, callback);
	return promise;
};

'use strict';
const Result = require('./lib/result');
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
	
	// Get the benchmarker warmed up.
	const noop = fn.length ? noopAsync : noopSync;
	const noise = benchmark(noop, noop, Math.min(Math.round(duration / 10), 300));
	
	// Then run the actual benchmark.
	return benchmark(fn, setup, duration);
};

const benchmark = (fn, setup, duration) => {
	if (!fn.length) return new Result(sync(fn, setup, duration));
	let callback;
	const promise = new Promise((resolve, reject) => { callback =
		(err, samples) => err ? reject(err) : resolve(new Result(samples)); });
	async(fn, setup, duration, callback);
	return promise;
};

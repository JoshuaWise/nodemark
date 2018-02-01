'use strict';
const Result = require('./result');
const async = require('./async');
const sync = require('./sync');

exports.sync = (fn, setup, duration) => {
	const allSamples = [];
	let totalCount = 0;
	duration += Date.now();
	
	// We measure in chunks of 100ms to periodically work the garbage collector.
	// This acts like a "dither" to smooth out the fluctuating memory usage caused
	// by the benchmarking engine itself (https://en.wikipedia.org/wiki/Dither).
	do {
		sync(() => {}, () => {}, 10); // Fake/dither benchmark
		const samples = sync(fn, setup, 100); // Actual benchmark
		allSamples.push(samples);
		totalCount += samples.length;
	} while (Date.now() < duration || totalCount < 10)
	
	return new Result([].concat(...allSamples));
};

exports.async = (fn, setup, duration) => {
	const allSamples = [];
	let totalCount = 0;
	duration += Date.now();
	
	// Here we do the same thing as commented in sync().
	const dither = () => async(cb => { cb(); }, cb => { cb(); }, 10);
	const actual = () => async(fn, setup, 100);
	const loop = (samples) => {
		allSamples.push(samples);
		totalCount += samples.length;
		if (Date.now() < duration || totalCount < 10) return dither().then(actual).then(loop);
		return new Result([].concat(...allSamples));
	};
	
	return dither().then(actual).then(loop);
};


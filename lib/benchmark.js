'use strict';
const Result = require('./result');
const async = require('./async');
const sync = require('./sync');

/**
 * Validates and return actual value to be used for "runs" property.
 */
const extractRunsValue = runs => {
	runs = runs && Number(runs);
	if (runs && (isNaN(runs) || runs <= 0)) throw new TypeError('Specified count of runs must be a positive number.');
	return runs;
};

exports.sync = (fn, setup, duration, runs) => {
	const allSamples = [];
	let totalCount = 0;
	duration += Date.now();
	runs = extractRunsValue(runs);

	const continueToRun = runs ?
		() => totalCount < runs :
		() => Date.now() < duration;

	// We measure in chunks of 100ms to periodically work the garbage collector.
	// This acts like a "dither" to smooth out the fluctuating memory usage caused
	// by the benchmarking engine itself (https://en.wikipedia.org/wiki/Dither).
	do {
		sync(() => {}, () => {}, 10); // Fake/dither benchmark
		const samples = sync(fn, setup, 100); // Actual benchmark
		allSamples.push(samples);
		totalCount += samples.length;
	} while (continueToRun() || totalCount < 10)

	return new Result([].concat(...allSamples), runs);
};

exports.async = (fn, setup, duration, runs) => {
	const allSamples = [];
	let totalCount = 0;
	duration += Date.now();
	runs = extractRunsValue(runs);

	const continueToRun = runs ?
		() => totalCount < runs :
		() => Date.now() < duration;

	// Here we do the same thing as commented in sync().
	const dither = () => async(cb => { cb(); }, cb => { cb(); }, 10);
	const actual = () => async(fn, setup, 100);
	const loop = (samples) => {
		allSamples.push(samples);
		totalCount += samples.length;
		if (continueToRun() || totalCount < 10) return dither().then(actual).then(loop);
		return new Result([].concat(...allSamples), runs);
	};

	return dither().then(actual).then(loop);
};


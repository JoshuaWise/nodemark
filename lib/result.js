'use strict';
const util = require('util');
const fMax = (a, b) => a > b ? a : b;
const fMin = (a, b) => a < b ? a : b;
const fSum = (a, b) => a + b;
const fSumSqDiff = u => (a, b) => a + (b - u) * (b - u);
const getMean = arr => arr.reduce(fSum, 0) / arr.length;
const getMgnError = (arr, mean) => Math.sqrt(arr.reduce(fSumSqDiff(mean), 0)) / arr.length * 2;

class BenchmarkResult {
	constructor(samples) {
		samples.splice(0, 5); // Remove samples gathered before v8 optimization
		this.mean = getMean(samples);
		this.error = getMgnError(samples, this.mean) / this.mean;
		this.max = Math.max(0, samples.reduce(fMax));
		this.min = Math.max(0, samples.reduce(fMin));
		this.count = samples.length;
		if (!(this.mean >= 10)) this.mean = this.error = this.max = this.min = NaN;
		Object.freeze(this);
	}
	nanoseconds(precision = 0) {
		return round(this.mean, precision);
	}
	microseconds(precision = 0) {
		return round(this.mean / 1e3, precision);
	}
	milliseconds(precision = 0) {
		return round(this.mean / 1e6, precision);
	}
	seconds(precision = 0) {
		return round(this.mean / 1e9, precision);
	}
	hz(precision = 0) {
		return round(1e9 / this.mean, precision);
	}
	sd(precision = 0) {
		return round(this.error * this.mean * Math.sqrt(this.count) / 2, precision);
	}
	toString(format = 'hz') {
		if (!unitMap[format]) throw new TypeError(`Unrecognized toString format: ${format}`);
		const value = String(this[format]()).replace(/\B(?=(?:\d{3})+$)/g, ',');
		const error = Math.round(this.error * 10000) / 100;
		return `${value}${unitMap[format]} \xb1${error}% (${this.count} samples)`;
	}
	[util.inspect.custom]() {
		return this.toString();
	}
}

const unitMap = Object.assign(Object.create(null), {
	nanoseconds: 'ns',
	microseconds: '\u03bcs',
	milliseconds: 'ms',
	seconds: 's',
	hz: ' ops/sec',
});

const round = (n, e) => {
	if (e >>> 0 !== e || e > 6) throw new TypeError('Rounding precision must be an integer between 0 and 6');
	const p = Math.pow(10, e);
	return Math.round(n * p) / p;
};

module.exports = BenchmarkResult;

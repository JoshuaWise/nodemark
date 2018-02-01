'use strict';
const benchmark = require('./lib/benchmark');
const makeAsync = fn => cb => { fn(); cb(); };

module.exports = (fn, setup, duration) => {
	if (typeof fn !== 'function') throw new TypeError('Expected benchmark subject to be a function');
	if (setup == null) setup = fn.length ? cb => { cb(); } : () => {};
	if (duration == null) duration = 3300;
	if (typeof setup !== 'function') throw new TypeError('Expected benchmark setup to be a function');
	if (!Number.isInteger(duration)) throw new TypeError('Expected benchmark duration to be an integer');
  if (duration <= 0) throw new TypeError('Expected benchmark duration to be positive');
	if (!fn.length && !setup.length) return benchmark.sync(fn, setup, duration);
	if (!fn.length) fn = makeAsync(fn);
	if (!setup.length) setup = makeAsync(setup);
	return benchmark.async(fn, setup, duration);
};

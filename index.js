'use strict';
const Result = require('./lib/result');
const async = require('./lib/async');
const sync = require('./lib/sync');
const noopSync = () => {};
const noopAsync = cb => cb();

module.exports = (fn, setup, duration) => {
  if (typeof fn !== 'function') throw new TypeError('Expected benchmark subject to be a function');
  if (setup == null) setup = fn.length ? noopAsync : noopSync;
  if (duration == null) duration = 3000;
  if (typeof setup !== 'function') throw new TypeError('Expected benchmark setup to be a function');
  if (!Number.isInteger(duration)) throw new TypeError('Expected benchmark duration to be an integer');
  if (!fn.length) return new Result(sync(fn, setup, duration));
  let callback;
  const promise = new Promise((rs, rj) => { callback = (e, s) => e ? rj(e) : rs(new Result(s)); });
  async(fn, setup, duration, callback);
  return promise;
};

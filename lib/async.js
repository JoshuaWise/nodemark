'use strict';

module.exports = (fn, setup, duration, callback) => {
	const { hrtime, nextTick } = process;
	const samples = [];
	duration += Date.now();
	
	let t0;
	let currentId = 0;
	
	const setupDone = (id) => (err) => {
		if (id !== currentId) return callback(new TypeError('The benchmark setup callback was invoked twice'));
		if (err) return callback(err);
		const subjectCallback = subjectDone(++currentId);
		t0 = hrtime();
		fn(subjectCallback);
	};
	
	const subjectDone = (id) => (err) => {
		const t1 = hrtime();
		if (id !== currentId) return callback(new TypeError('The benchmark subject callback was invoked twice'));
		if (err) return callback(err);
		samples.push(t1[1] - t0[1] + (t1[0] - t0[0]) * 1e9);
		currentId += 1;
		if (Date.now() < duration || samples.length < 10) nextTick(runIteration);
		else callback(null, samples);
	};
	
	const runIteration = () => { setup(setupDone(currentId)); };
	nextTick(runIteration);
};

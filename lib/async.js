'use strict';

module.exports = (fn, setup, duration, callback) => {
	const { hrtime, nextTick } = process;
	const samples = [];
	duration += Date.now();
	
	let t0;
	
	const setupDone = (err) => {
		if (err) return void callback(err);
		t0 = hrtime();
		fn(sampleDone);
	};
	
	const sampleDone = (err) => {
		const t1 = hrtime();
		if (err) return void callback(err);
		samples.push(t1[1] - t0[1] + (t1[0] - t0[0]) * 1e9);
		if (Date.now() < duration || samples.length < 10) nextTick(runIteration);
		else callback(null, samples);
	};
	
	const runIteration = () => { setup(setupDone); };
	nextTick(runIteration);
};

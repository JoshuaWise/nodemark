'use strict';

module.exports = (fn, setup, duration, callback) => {
	const { hrtime, nextTick } = process;
	const noop = cb => { cb(); };
	const samples = [];
	duration += Date.now();
	
	let t0;
	let t2;
	let noise = 0;
	let currentId = 0;
	
	const setupDone = (id) => (err) => {
		if (id !== currentId) return callback(new TypeError('The benchmark setup callback was invoked twice'));
		if (err) return callback(err);
		const noopCallback = noopDone(++currentId);
		t0 = hrtime();
		noop(noopCallback);
	};
	
	const noopDone = (fake1) => (fake2) => {
		const t1 = hrtime();
		if (fake1 !== currentId) return callback(new TypeError('THIS SHOULD NEVER HAPPEN'));
		if (fake2) return callback(fake2);
		noise = t1[1] - t0[1] + (t1[0] - t0[0]) * 1e9;
		const subjectCallback = subjectDone(++currentId);
		t2 = hrtime();
		subject(subjectCallback);
	};
	
	const subjectDone = (id) => (err) => {
		const t3 = hrtime();
		if (id !== currentId) return callback(new TypeError('The benchmark subject callback was invoked twice'));
		if (err) return callback(err);
		samples.push(t3[1] - t2[1] + (t3[0] - t2[0]) * 1e9 - noise);
		currentId += 1;
		if (Date.now() < duration || samples.length < 10) nextTick(runIteration);
		else callback(null, samples);
	};
	
	const runIteration = () => { setup(setupDone(currentId)); };
	nextTick(runIteration);
};

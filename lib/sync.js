'use strict';

module.exports = (fn, setup, duration) => {
	const { hrtime } = process;
	const samples = [];
	duration += Date.now();
	
	do {
		setup();
		const t0 = hrtime();
		fn();
		const t1 = hrtime();
		samples.push(t1[1] - t0[1] + (t1[0] - t0[0]) * 1e9);
	} while (Date.now() < duration || samples.length < 10);
	
	return samples;
};

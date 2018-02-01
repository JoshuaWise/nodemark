'use strict';

module.exports = (fn, setup, duration) => {
	const { hrtime } = process;
	const noop = () => {};
	const samples = [];
	duration += Date.now();
	
	do {
		setup();
		const t0 = hrtime();
		noop(); // Measure the noop time so we can factor it out
		const t1 = hrtime();
		fn();
		const t2 = hrtime();
		samples.push(t2[1] - t1[1] + (t2[0] - t1[0]) * 1e9 - (t1[1] - t0[1] + (t1[0] - t0[0]) * 1e9));
	} while (Date.now() < duration);
	
	return samples;
};

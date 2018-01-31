'use strict';

module.exports = (samples, noise) => {
	// Remove samples gathered before v8 optimization.
	samples.splice(0, 5);
	
	// Factor out benchmark noise from the sample set.
	if (noise && noise.mean) {
		const bias = noise.nanoseconds();
		for (let i = 0; i < samples.length; ++i) {
			samples[i] -= bias;
		}
	}
	
	return samples;
};

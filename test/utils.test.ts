import * as assert from 'assert';

import * as utils from '../src/utils'



describe('utils', () => {
	it('detects the first number of tabs.', () => {
		assert.strictEqual(utils.dedent`
			this will be
	dedented by
		up to
				3 tabs
		`, '\nthis will be\ndedented by\nup to\n\t3 tabs\n');
	});

	it('dedents by the given number of tabs.', () => {
		assert.strictEqual(utils.dedent(2)`
			this will be
	dedented by
		up to
				2 tabs
		`, '\n\tthis will be\ndedented by\nup to\n\t\t2 tabs\n');
	});
});

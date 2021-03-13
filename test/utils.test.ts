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
});

import * as assert from 'assert';

import {Filebound} from '../../src/utils';
import type {Char} from '../../src/scanner/Char';
import {Scanner} from '../../src/scanner/Scanner';
import {
	lastItem,
} from '../helpers';



describe('Scanner', () => {
	describe('#generate', () => {
		const chars: Char[] = [...new Scanner().generate(`
		5  +  30 \u000d
		6 ^ 2 - 37 *
		( 4 * \u000d9 ^ 3
		3 - 50 + * 2
		5 + 03 + '' * 'hello' *  -2
		600  /  3  *  2
		600  /  (3  *  2
		4 * 2 ^ 3
		`)];

		it('wraps source text.', () => {
			assert.strictEqual(chars[0].source, Filebound.SOT);
			assert.strictEqual(chars[1].source, '\n');
			assert.strictEqual(chars[5].source, '5');
			assert.strictEqual(chars[chars.length - 2].source, '\n');
			assert.strictEqual(lastItem(chars).source, Filebound.EOT);
		});

		it('normalizes line endings.', () => {
			assert.strictEqual(chars[14].source, '\n');
			assert.strictEqual(chars[29].source, '\n');
			assert.strictEqual(chars[32].source, '(');
			assert.strictEqual(chars[38].source, '\n');
			assert.strictEqual(chars[39].source, '9');
		});
	});
});

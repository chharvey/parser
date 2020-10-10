import * as assert from 'assert';

import {Filebound} from '../../src/utils';
import {Scanner} from '../../src/scanner/Scanner';
import {
	lastItem,
} from '../helpers';



describe('Scanner', () => {
	const scanner: Scanner = new Scanner(`
		5  +  30 \u000d
		6 ^ 2 - 37 *
		( 4 * \u000d9 ^ 3
		3 - 50 + * 2
		5 + 03 + '' * 'hello' *  -2
		600  /  3  *  2
		600  /  (3  *  2
		4 * 2 ^ 3
	`);

	describe('.constructor', () => {
		it('wraps source text.', () => {
			assert.strictEqual(scanner.source_text[0], Filebound.SOT);
			assert.strictEqual(scanner.source_text[1], '\n');
			assert.strictEqual(scanner.source_text[5], '5');
			assert.strictEqual(scanner.source_text[scanner.source_text.length - 2], '\n');
			assert.strictEqual(lastItem(scanner.source_text), Filebound.EOT);
		});

		it('normalizes line endings.', () => {
			assert.strictEqual(scanner.source_text[14], '\n');
			assert.strictEqual(scanner.source_text[29], '\n');
			assert.strictEqual(scanner.source_text[32], '(');
			assert.strictEqual(scanner.source_text[38], '\n');
			assert.strictEqual(scanner.source_text[39], '9');
		});
	});
});

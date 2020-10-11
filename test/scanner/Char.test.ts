import * as assert from 'assert';

import {Filebound} from '../../src/utils';
import {Char} from '../../src/scanner/Char';
import {Scanner} from '../../src/scanner/Scanner';
import {
	lastIndex,
} from '../helpers';



describe('Char', () => {
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

	describe('.eq', () => {
		it('compares one character.', () => {
			assert.ok(Char.eq('+', new Char(scanner, 8)))
		});

		it('compares several characters.', () => {
			assert.ok(Char.eq('30', new Char(scanner, 11), new Char(scanner, 12)))
		});
	});

	describe('.inc', () => {
		it('the characters, concatenated, should be among the array entries.', () => {
			assert.ok(Char.inc(['he', 'llo'], new Char(scanner, 77), new Char(scanner, 78)))
		});
	});

	describe('#source, #line, #column', () => {
		it('returns the source text, line number, and column number.', () => {
			const {source, line_index, col_index} = new Char(scanner, 43);
			assert.deepStrictEqual(
				[source, line_index + 1, col_index + 1],
				['3',    5,              5],
			);
		});
	});

	describe('#lookahead', () => {
		it('is Char.', () => {
			const lookahead: Char | null = new Char(scanner, 27).lookahead();
			assert.ok(lookahead instanceof Char);
			const {source, line_index, col_index} = lookahead!;
			assert.deepStrictEqual(
				[source, line_index + 1, col_index + 1],
				['*',    3,              14],
			);
		});

		it('if last is null.', () => {
			const char: Char = new Char(scanner, lastIndex(scanner.source_text));
			assert.strictEqual(char.source, Filebound.EOT);
			assert.strictEqual(char.lookahead(), null);
		});
	});
});

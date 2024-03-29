import * as assert from 'assert';

import {Char} from '../../src/scanner/Char';
import {
	Token,
} from '../../src/lexer/Token';
import {Scanner} from '../../src/scanner/Scanner';
import {
	LexError01,
	LexError02,
} from '../../src/error/LexError';



describe('LexError', () => {
	describe('#message', () => {
		specify('LexError01', () => {
			assert.strictEqual(
				new LexError01(new Char(`\u0002\n-\n\u0003`, 2)).message,
				'Unrecognized character: \`-\` at line 1 col 1.',
			);
		});

		specify('LexError02', () => {
			const src: string = `unfinished`;
			const chars: Char[] = [...Scanner.generate(src)].slice(2, -2); // slice off line normalization
			assert.strictEqual(
				new LexError02(new Token('TOKEN', chars[0], ...chars.slice(1))).message,
				'Found end of file before end of TOKEN: \`unfinished\`.',
			);
		});
	});
});

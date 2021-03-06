import * as assert from 'assert';

import type {Char} from '../../src/scanner/Char';
import {Token} from '../../src/lexer/Token';
import {Scanner} from '../../src/scanner/Scanner';
import {
	ParseError01,
} from '../../src/error/ParseError';
import {
	LexerSample,
} from '../sample/';



describe('ParseError', () => {
	describe('#message', () => {
		specify('ParseError01', () => {
			const src: string = `lookahead`;
			const chars: Char[] = [...new Scanner(src).generate()].slice(2, -2); // slice off line normalization
			assert.strictEqual(
				new ParseError01(new Token('TOKEN', new LexerSample(src), chars[0], ...chars.slice(1))).message,
				'Unexpected token: \`lookahead\` at line 1 col 1.',
			);
		});
	});
});

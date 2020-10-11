import * as assert from 'assert';

import type {Token} from '../../src/lexer/Token';
import {
	LexerSample,
	TerminalNumber,
	TerminalOperator,
} from '../sample/';



describe('Terminal', () => {
	describe('#displayName', () => {
		it('returns the display name.', () => {
			assert.strictEqual(TerminalNumber  .instance.displayName, 'NUMBER');
			assert.strictEqual(TerminalOperator.instance.displayName, 'OPERATOR');
		});
	});

	describe('#match', () => {
		it('returns whether a token satisfies a terminal.', () => {
			const tokens: Token[] = [...new LexerSample(`
				42 *
			`).generate()];
			assert.ok( TerminalNumber  .instance.match(tokens[2]));
			assert.ok( TerminalOperator.instance.match(tokens[4]));
			assert.ok(!TerminalNumber  .instance.match(tokens[4]));
			assert.ok(!TerminalOperator.instance.match(tokens[2]));
		});
	});
});

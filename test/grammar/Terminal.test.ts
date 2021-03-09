import * as assert from 'assert';

import type {Token} from '../../src/lexer/Token';
import {
	LexerEBNF,
	TOKEN as EBNF_TOKEN,
	TERMINAL as EBNF_TERMINAL,
} from '../../src/ebnf/';
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

	describe('#random', () => {
		[
			EBNF_TERMINAL.TerminalIdentifier.instance,
			EBNF_TERMINAL.TerminalCharCode.instance,
			EBNF_TERMINAL.TerminalString.instance,
			EBNF_TERMINAL.TerminalCharClass.instance,
		].forEach((terminal) => {
			it(`returns source text that matches ${ terminal.displayName }`, () => {
				const tokens: Token[] = [...new LexerEBNF(`
					${ Array.from(new Array(100), (_) => terminal.random()).join(' ') }
				`).generate()].filter((token) => (
					   token instanceof EBNF_TOKEN.TokenIdentifier
					|| token instanceof EBNF_TOKEN.TokenCharCode
					|| token instanceof EBNF_TOKEN.TokenString
					|| token instanceof EBNF_TOKEN.TokenCharClass
				));
				assert.ok(tokens.every((token) => terminal.match(token)));
			});
		});
	});
});

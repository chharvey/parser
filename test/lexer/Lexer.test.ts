import * as assert from 'assert'

import {Filebound} from '../../src/Filebound'
import {
	Token,
	TokenFilebound,
	TokenWhitespace,
} from '../../src/lexer/Token'
import {Lexer} from '../../src/lexer/Lexer'
import {
	LexError01,
} from '../../src/error/LexError'
import {
	lastItem,
} from '../helpers'
import {
	MyLexer,
	MyTokenComment,
} from '../samples'



describe('Lexer', () => {
	describe('#generate', () => {
		it('recognizes `TokenFilebound` conditions.', () => {
			const tokens: Token[] = [...new MyLexer(`
				5  +  30 \u000d
				6 ^ 2 +) 37 *
				( 4 * \u000d9 ^ 3
				3 + 50 + *2
				5 + 03 + ['' * 'hello'] *  +2
				600    3  *  2
				600    (3  *  2
				4 * 2 ^ 3
			`).generate()];
			assert.ok(tokens[0] instanceof TokenFilebound);
			assert.strictEqual(tokens[0].source, Filebound.SOT);
			assert.ok(lastItem(tokens) instanceof TokenFilebound);
			assert.strictEqual(lastItem(tokens).source, Filebound.EOT);
		});

		it('recognizes `TokenWhitespace` conditions.', () => {
			[...new Lexer(TokenWhitespace.CHARS.join('')).generate()].slice(1, -1).forEach((value) => {
				assert.ok(value instanceof TokenWhitespace);
			});
		});

		context('recognizes `TokenComment` conditions.', () => {
			it('recognizes empty multiline comment.', () => {
				const tokens: Token[] = [...new MyLexer(`
					[]
					[ ]
				`).generate()];
				assert.ok(tokens[2] instanceof MyTokenComment);
				assert.ok(tokens[4] instanceof MyTokenComment);
				assert.strictEqual(tokens[2].source, '[]');
				assert.strictEqual(tokens[4].source, '[ ]');
			});

			it('recognizes nonempty multiline comment.', () => {
				const comment: Token = [...new MyLexer(`
					[multiline
					that has contents
					comment]
				`).generate()][2];
				assert.ok(comment instanceof MyTokenComment);
			});
		});

		it('rejects unrecognized characters.', () => {
			assert.throws(() => [...new MyLexer(`-`).generate()], LexError01);
		});
	});
});

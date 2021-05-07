import * as assert from 'assert';

import {Filebound} from '../../src/utils';
import {
	Token,
	TokenFilebound,
	TokenWhitespace,
} from '../../src/lexer/Token';
import {Lexer} from '../../src/lexer/Lexer';
import {
	LexError01,
	LexError02,
} from '../../src/error/LexError';
import {
	lastItem,
} from '../helpers';
import {
	LexerSample,
	TokenCommentSample,
} from '../sample/';



describe('Lexer', () => {
	describe('#generate', () => {
		it('recognizes `TokenFilebound` conditions.', () => {
			const tokens: Token[] = [...new LexerSample().generate(`
				5  +  30 \u000d
				6 ^ 2 +) 37 *
				( 4 * \u000d9 ^ 3
				3 + 50 + *2
				5 + 03 + ['' * 'hello'] *  +2
				600    3  *  2
				600    (3  *  2
				4 * 2 ^ 3
			`)];
			assert.ok(tokens[0] instanceof TokenFilebound);
			assert.strictEqual(tokens[0].source, Filebound.SOT);
			assert.ok(lastItem(tokens) instanceof TokenFilebound);
			assert.strictEqual(lastItem(tokens).source, Filebound.EOT);
		});

		it('recognizes `TokenWhitespace` conditions.', () => {
			[...new Lexer().generate(TokenWhitespace.CHARS.join(''))].slice(1, -1).forEach((value) => {
				assert.ok(value instanceof TokenWhitespace);
			});
		});

		context('recognizes `TokenComment` conditions.', () => {
			it('recognizes empty multiline comment.', () => {
				const tokens: Token[] = [...new LexerSample().generate(`
					[]
					[ ]
				`)];
				assert.ok(tokens[2] instanceof TokenCommentSample);
				assert.ok(tokens[4] instanceof TokenCommentSample);
				assert.strictEqual(tokens[2].source, '[]');
				assert.strictEqual(tokens[4].source, '[ ]');
			});

			it('recognizes nonempty multiline comment.', () => {
				const comment: Token = [...new LexerSample().generate(`
					[multiline
					that has contents
					comment]
				`)][2];
				assert.ok(comment instanceof TokenCommentSample);
			});
		});

		it('rejects unrecognized characters.', () => {
			assert.throws(() => [...new LexerSample().generate(`-`)], LexError01);
		});

		it(`throws when token is unfinished.`, () => {
			[`
				[unfinished multiline
				comment
			`, `
				[unfinished multiline containing U+0003 END OF TEXT
				\u0003
				comment
			`].forEach((src) => {
				assert.throws(() => [...new LexerSample().generate(src)], LexError02);
			});
		});
	});
});

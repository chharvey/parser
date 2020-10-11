import * as assert from 'assert';

import {
	LexError02,
} from '../../src/error/LexError';
import {
	LexerSample,
	TokenCommentSample,
} from '../sample/';



describe('Token', () => {
	describe('.constructor', () => {
		it(`throws when token is unfinished.`, () => {
			[`
				[unfinished multiline
				comment
			`, `
				[unfinished multiline containing U+0003 END OF TEXT
				\u0003
				comment
			`].map((source) => new LexerSample(source)).forEach((lexer) => {
				assert.throws(() => new TokenCommentSample(lexer), LexError02);
			});
		});
	});

	describe('#serialize', () => {
		specify('TokenComment', () => {
			assert.strictEqual([...new LexerSample(`
				[multiline
				comment]
			`).generate()][2].serialize(), `
				<COMMENT line="2" col="5">[multiline
				comment]</COMMENT>
			`.trim());
		});
	});
});

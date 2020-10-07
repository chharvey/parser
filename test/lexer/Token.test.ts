import * as assert from 'assert'

import {
	LexError02,
} from '../../src/error/LexError'
import {
	MyLexer,
	MyTokenComment,
} from '../samples'



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
			`].map((source) => new MyLexer(source)).forEach((lexer) => {
				assert.throws(() => new MyTokenComment(lexer), LexError02);
			});
		});
	});

	describe('#serialize', () => {
		specify('TokenComment', () => {
			assert.strictEqual([...new MyLexer(`
				[multiline
				comment]
			`).generate()][2].serialize(), `
				<COMMENT line="2" col="5">[multiline
				comment]</COMMENT>
			`.trim());
		});
	});
});

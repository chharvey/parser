import * as assert from 'assert';

import {
	LEXER as LEXER_Sample,
} from '../sample/';



describe('Token', () => {
	describe('#serialize', () => {
		specify('TokenComment', () => {
			assert.strictEqual([...LEXER_Sample.generate(`
				[multiline
				comment]
			`)][2].serialize(), `
				<COMMENT line="2" col="5">[multiline
				comment]</COMMENT>
			`.trim());
		});
	});
});

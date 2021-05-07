import * as assert from 'assert';

import {
	LexerSample,
} from '../sample/';



describe('Token', () => {
	describe('#serialize', () => {
		specify('TokenComment', () => {
			assert.strictEqual([...new LexerSample().generate(`
				[multiline
				comment]
			`)][2].serialize(), `
				<COMMENT line="2" col="5">[multiline
				comment]</COMMENT>
			`.trim());
		});
	});
});

import * as assert from 'assert';

import {
	TokenFilebound,
} from '../../src/lexer/Token';
import type {ParseNode} from '../../src/parser/ParseNode';
import {
	ParseError01,
} from '../../src/error/ParseError';
import {
	MyParser,
} from '../samples';



describe('Parser', () => {
	describe('#parse', () => {
		context('Goal ::= #x02 #x03', () => {
			it('returns only file bounds.', () => {
				const tree: ParseNode = new MyParser(``).parse();
				assert.strictEqual(tree.children.length, 2);
				tree.children.forEach((child) => assert.ok(child instanceof TokenFilebound));
			});
		});

		it('rejects unexpected tokens.', () => {
			assert.throws(() => new MyParser(`(+ 3 4 5)`).parse(), ParseError01);
		});
	});
});

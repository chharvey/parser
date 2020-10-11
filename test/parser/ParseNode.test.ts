import * as assert from 'assert';

import {ParseNode} from '../../src/parser/ParseNode';
import {
	grammar,
} from '../samples';



describe('ParseNode', () => {
	describe('.fromJSON', () => {
		it('returns a string representing new subclasses of ParseNode.', () => {
			assert.deepStrictEqual(grammar.map((prod) => ParseNode.fromJSON(prod)), [
		`
			export class ParseNodeUnit extends ParseNode {
				declare children:
					readonly [Token] | readonly [Token,Token,ParseNodeUnit,ParseNodeUnit,Token]
				;
			}
		`, `
			export class ParseNodeGoal extends ParseNode {
				declare children:
					readonly [Token,Token] | readonly [Token,ParseNodeUnit,Token]
				;
			}
		`
			]);
		});
	});
});

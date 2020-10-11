import * as assert from 'assert';

import {ParseNode} from '../../src/parser/ParseNode';
import {
	grammar,
} from '../samples';



describe('ParseNode', () => {
	describe('.fromJSON', () => {
		it('returns a string representing new subclasses of ParseNode.', () => {
			assert.strictEqual(ParseNode.fromJSON(grammar), (
		`
			import {
				Token,
				ParseNode,
			} from '@chharvey/parser';
\t\t\t
				export class ParseNodeUnit extends ParseNode {
					declare children:
						readonly [Token] | readonly [Token,Token,ParseNodeUnit,ParseNodeUnit,Token]
					;
				}
\t\t\t
				export class ParseNodeGoal extends ParseNode {
					declare children:
						readonly [Token,Token] | readonly [Token,ParseNodeUnit,Token]
					;
				}
\t\t\t
		`
			));
		});
	});
});

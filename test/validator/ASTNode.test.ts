import * as assert from 'assert';

import type {ParseNode} from '../../src/parser/ParseNode';
import {ASTNode} from '../../src/validator/ASTNode';
import {
	ParseNodeUnit,
	ParserSample,
} from '../sample';



describe('ASTNode', () => {
	describe('#serialize', () => {
		it('prints a readable string.', () => {
			const tree: ParseNode = new ParserSample(`(+ (* 2 3) 5)`).parse();
			const add:   ParseNodeUnit = tree.children[1] as ParseNodeUnit;
			const mult:  ParseNodeUnit = add .children[2] as ParseNodeUnit;
			const five:  ParseNodeUnit = add .children[3] as ParseNodeUnit;
			const two:   ParseNodeUnit = mult.children[2] as ParseNodeUnit;
			const three: ParseNodeUnit = mult.children[3] as ParseNodeUnit;
			assert.strictEqual(new ASTNode(tree, {}, [ // normally, a decorator would do this programmatically
				new ASTNode(add, {}, [
					new ASTNode(mult, {}, [
						new ASTNode(two),
						new ASTNode(three),
					]),
					new ASTNode(five),
				]),
			]).serialize(), `
				< line="0" col="1" source="␂ ( + ( * 2 3 ) 5 ) ␃">
					< line="1" col="1" source="( + ( * 2 3 ) 5 )">
						< line="1" col="4" source="( * 2 3 )">
							< line="1" col="7" source="2"/>
							< line="1" col="9" source="3"/>
						</>
						< line="1" col="12" source="5"/>
					</>
				</>
			`.replace(/\n\t*/g, ''));
		});
	});
});

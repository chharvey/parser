import * as assert from 'assert';
import type {ParseNode} from '../../src/parser/ParseNode';
import {ASTNode} from '../../src/validator/ASTNode';
import {
	PARSENODE as PARSENODE_SAMPLE,
	PARSER as PARSER_SAMPLE,
} from '../sample/';



describe('ASTNode', () => {
	describe('#serialize', () => {
		it('prints a readable string.', () => {
			const tree: ParseNode = PARSER_SAMPLE.parse(`(+ (* 2 3) 5)`);
			const add:   PARSENODE_SAMPLE.ParseNodeUnit = tree.children[1] as PARSENODE_SAMPLE.ParseNodeUnit;
			const mult:  PARSENODE_SAMPLE.ParseNodeUnit = add .children[2] as PARSENODE_SAMPLE.ParseNodeUnit;
			const five:  PARSENODE_SAMPLE.ParseNodeUnit = add .children[3] as PARSENODE_SAMPLE.ParseNodeUnit;
			const two:   PARSENODE_SAMPLE.ParseNodeUnit = mult.children[2] as PARSENODE_SAMPLE.ParseNodeUnit;
			const three: PARSENODE_SAMPLE.ParseNodeUnit = mult.children[3] as PARSENODE_SAMPLE.ParseNodeUnit;
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

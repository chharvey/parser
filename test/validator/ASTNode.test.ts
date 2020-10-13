import * as assert from 'assert';

import type {ParseNode} from '../../src/parser/ParseNode';
import {ASTNode} from '../../src/validator/ASTNode';
import {
	ParserEBNF,
	Decorator,
} from '../../src/ebnf/';
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

	describe('ASTNodeGoal', () => {
		describe('#transform', () => {
			specify('SemanticGoal ::= SemanticProduction*;', () => {
				assert.deepStrictEqual(Decorator.decorate(new ParserEBNF(`
					Unit ::= NUMBER | "(" OPERATOR Unit Unit ")";
					Goal ::= #x02 Unit? #x03;
				`).parse()).transform(), JSON.parse(`
					[
						{
							"name": "Unit",
							"defn": [
								[{"term": "NUMBER"}],
								["'('", {"term": "OPERATOR"}, {"prod": "Unit"}, {"prod": "Unit"}, "')'"]
							]
						},
						{
							"name": "Goal",
							"defn": [
								["'\\\\u0002'",                   "'\\\\u0003'"],
								["'\\\\u0002'", {"prod": "Unit"}, "'\\\\u0003'"]
							]
						}
					]
				`));
			});
		});
	});
});

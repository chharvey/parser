import * as assert from 'assert';

import {
	PARSER,
	ParserEBNF,
	ASTNODE,
	Binop,
	Decorator,
} from '../../src/ebnf/';
import {
	assert_arrayLength,
} from '../helpers';



describe('Decorator', () => {
	describe('.decorate', () => {
		context('transforms an EBNF parse node into an AST node.', () => {
			const goal: ASTNODE.ASTNodeGoal = Decorator.decorate(new ParserEBNF(`
				Unit ::= NUMBER | "(" OPERATOR Unit Unit ")";
				Goal ::= #x02 Unit? #x03;
			`).parse() as PARSER.ParseNodeGoal);

			specify('Goal ::= #x02 Production* #x03;', () => {
				/*
					<Goal>
						<Production source='Unit ::= NUMBER | "(" OPERATOR Unit Unit ")" ;'>...</Production>
						<Production source='Goal ::= #x02 Unit ? #x03 ;'>...</Production>
					</Goal>
				*/
				assert_arrayLength(goal.children, 2, 'goal should have 2 children');
				assert.deepStrictEqual(goal.children.map((c) => c.source), [
					'Unit ::= NUMBER | "(" OPERATOR Unit Unit ")" ;',
					'Goal ::= #x02 Unit ? #x03 ;',
				]);
			});

			specify('Production ::= NonterminalName "::=" Definition ";";', () => {
				/*
					<Production>
						<Nonterminal name='Unit'/>
						<Op source='NUMBER | "(" OPERATOR Unit Unit ")"'>...</Op>
					</Production>
				*/
				const prod: ASTNODE.ASTNodeProduction = goal.children[0];
				assert.strictEqual(prod.children[0]['name'], 'Unit');
				assert.strictEqual(prod.children[1].source, 'NUMBER | "(" OPERATOR Unit Unit ")"');
			});

			specify('Altern ::= Altern "|" Concat;', () => {
				/*
					<Op operator=ALTERN>
						<Ref name='NUMBER'/>
						<Op operator=ORDER source='"(" OPERATOR Unit Unit ")"'>...</Op>
					</Production>
				*/
				const altern: ASTNODE.ASTNodeExpr = goal.children[0].children[1];
				assert.ok(altern instanceof ASTNODE.ASTNodeOpBin);
				assert.strictEqual(altern['operator'], Binop.ALTERN);
				const left:  ASTNODE.ASTNodeExpr = altern.children[0];
				const right: ASTNODE.ASTNodeExpr = altern.children[1];
				assert.ok(left  instanceof ASTNODE.ASTNodeRef);
				assert.ok(right instanceof ASTNODE.ASTNodeOpBin);
				assert.strictEqual(left['name'], 'NUMBER');
				assert.strictEqual(right['operator'], Binop.ORDER);
				assert.strictEqual(right.source, '"(" OPERATOR Unit Unit ")"');
			});
		});
	});
});

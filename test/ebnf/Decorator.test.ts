import * as assert from 'assert';

import {
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
			`).parse());

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

			specify('Altern ::= Altern "|" Mult;', () => {
				/*
					<Op operator=ALTERN>
						<Ref name='NUMBER'/>
						<Op operator=ORDER source='"(" OPERATOR Unit Unit ")"'>...</Op>
					</Op>
				*/
				const altern: ASTNODE.ASTNodeExpr = goal.children[0].children[1];
				assert.ok(altern instanceof ASTNODE.ASTNodeOpBin);
				assert.strictEqual(altern['operator'], Binop.ALTERN);
				const [left, right]: readonly ASTNODE.ASTNodeExpr[] = altern.children;
				assert.ok(left  instanceof ASTNODE.ASTNodeRef);
				assert.ok(right instanceof ASTNODE.ASTNodeOpBin);
				assert.strictEqual(left['name'], 'NUMBER');
				assert.strictEqual(right['operator'], Binop.ORDER);
				assert.strictEqual(right.source, '"(" OPERATOR Unit Unit ")"');
			});

			specify('Mult ::= Mult "||" Concat;', () => {
				const goal: ASTNODE.ASTNodeGoal = Decorator.decorate(new ParserEBNF(`
					Unit ::= NUMBER || "(" OPERATOR Unit Unit ")";
					Goal ::= #x02 Unit? #x03;
				`).parse());
				/*
					<Op operator=MULT>
						<Ref name='NUMBER'/>
						<Op operator=ORDER source='"(" OPERATOR Unit Unit ")"'>...</Op>
					</Production>
				*/
				const mult: ASTNODE.ASTNodeExpr = goal.children[0].children[1];
				assert.ok(mult instanceof ASTNODE.ASTNodeOpBin);
				assert.strictEqual(mult['operator'], Binop.MULT);
				const [left, right]: readonly ASTNODE.ASTNodeExpr[] = mult.children;
				assert.ok(left  instanceof ASTNODE.ASTNodeRef);
				assert.ok(right instanceof ASTNODE.ASTNodeOpBin);
				assert.strictEqual(left['name'], 'NUMBER');
				assert.strictEqual(right['operator'], Binop.ORDER);
				assert.strictEqual(right.source, '"(" OPERATOR Unit Unit ")"');
			});
		});
	});
});

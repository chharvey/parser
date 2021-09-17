import * as assert from 'assert';

import {
	ASTNODE,
	Unop,
	Binop,
	PARSER as PARSER_EBNF,
	Decorator,
} from '../../src/ebnf/';
import {
	assert_arrayLength,
} from '../helpers';



describe('Decorator', () => {
	describe('.decorate', () => {
		context('transforms an EBNF parse node into an AST node.', () => {
			const goal: ASTNODE.ASTNodeGoal = Decorator.decorate(PARSER_EBNF.parse(`
				Unit ::= NUMBER | "(" OPERATOR Unit Unit ")";
				Goal ::= #x02 Unit? #x03;
			`));

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

			specify('Unary ::= Unit "*"', () => {
				/*
					<Op operator=OPT source='Production*'>
						<Op operator=PLUS>
							<Ref name='Production'/>
						</Op>
					</Op>
				*/
				const outer: ASTNODE.ASTNodeExpr = (((Decorator.decorate(PARSER_EBNF.parse(`
					Goal ::= #x02 Production* #x03;
				`)).children[0] as ASTNODE.ASTNodeProduction)
					.children[1] as ASTNODE.ASTNodeOpBin) // source='#x02 Production* #x03'
					.children[0] as ASTNODE.ASTNodeOpBin) // source='#x02 Production*'
					.children[1] as ASTNODE.ASTNodeExpr   // source='Production*'
				;
				assert.ok(outer instanceof ASTNODE.ASTNodeOpUn);
				assert.deepStrictEqual(
					[outer['operator'], outer.source],
					[Unop.OPT,          'Production *'],
				);
				const inner: ASTNODE.ASTNodeExpr = outer.children[0];
				assert.ok(inner instanceof ASTNODE.ASTNodeOpUn);
				assert.strictEqual(inner['operator'], Unop.PLUS);
				const ref: ASTNODE.ASTNodeExpr = inner.children[0];
				assert.ok(ref instanceof ASTNODE.ASTNodeRef);
				assert.strictEqual(ref['name'], 'Production');
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

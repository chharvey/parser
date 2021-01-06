import * as assert from 'assert';

import {Filebound} from '../../src/utils';
import {
	Token,
	TokenFilebound,
} from '../../src/lexer/Token';
import type {ParseNode} from '../../src/parser/ParseNode';
import {
	ParseError01,
} from '../../src/error/ParseError';
import {
	PARSER as EBNF,
	ParserEBNF,
} from '../../src/ebnf/';
import {
	assert_arrayLength,
} from '../helpers';
import {
	ParserSample,
	ParseNodeUnit,
	ParseNodeGoal,
} from '../sample/';



describe('Parser', () => {
	describe('#parse', () => {
		context('Goal ::= #x02 #x03', () => {
			it('returns only file bounds.', () => {
				const tree: ParseNode = new ParserSample(``).parse();
				assert.strictEqual(tree.children.length, 2);
				tree.children.forEach((child) => assert.ok(child instanceof TokenFilebound));
			});
		});

		it('rejects unexpected tokens.', () => {
			assert.throws(() => new ParserSample(`(+ 3 4 5)`).parse(), ParseError01);
		});

		describe('ParserSample', () => {
			specify('Goal ::= #x02 Unit #x03;', () => {
				const goal: ParseNode = new ParserSample(`(+ (* 2 3) 5)`).parse();
				/*
					<Goal>
						<FILEBOUND>␂</FILEBOUND>
						<Unit src="(+ (* 2 3) 5)">...</Unit>
						<FILEBOUND>␃</FILEBOUND>
					</Goal>
				*/
				assert.ok(goal instanceof ParseNodeGoal);
				assert_arrayLength(goal.children, 3, 'goal should have 3 children');
				const [sot, unit, eot]: readonly [Token, ParseNodeUnit, Token] = goal.children;
				assert.deepStrictEqual(
					[sot.source,    unit.source,         eot.source],
					[Filebound.SOT, `( + ( * 2 3 ) 5 )`, Filebound.EOT],
				);
			});

			specify('Unit ::= "(" OPERATOR Unit Unit ")";', () => {
				const unit: ParseNodeUnit = new ParserSample(`(+ (* 2 3) 5)`).parse().children[1] as ParseNodeUnit;
				/*
					<Unit>
						<PUNCTUATOR>(</PUNCTUATOR>
						<OPERATOR>+</OPERATOR>
						<Unit src="(* 2 3)">...</Unit>
						<Unit src="5">...</Unit>
						<PUNCTUATOR>)</PUNCTUATOR>
					</Unit>
				*/
				assert_arrayLength(unit.children, 5, 'unit should have 5 children');
				const [open, op, left, right, close]: readonly [Token, Token, ParseNodeUnit, ParseNodeUnit, Token] = unit.children;
				assert.deepStrictEqual(
					[open.source, op.source, left.source, right.source, close.source],
					[`(`,         `+`,       `( * 2 3 )`, `5`,          `)`],
				);
			});
		});

		describe('ParserEBNF', () => {
			specify('Goal ::= #x02 Production* #x03;', () => {
				const goal: ParseNode = new ParserEBNF(`
					Unit ::= NUMBER | "(" OPERATOR Unit Unit ")";
					Goal ::= #x02 Unit? #x03;
				`).parse();
				/*
					<Goal>
						<FILEBOUND>␂</FILEBOUND>
						<Goal__0__List>
							<Goal__0__List>
								<Production source='Unit ::= NUMBER | "(" OPERATOR Unit Unit ")" ;'>...</Production>
							</Goal__0__List>
							<Production source='Goal ::= #x02 Unit ? #x03 ;'>...</Production>
						</Goal__0__List>
						<FILEBOUND>␃</FILEBOUND>
					</Goal>
				*/
				assert.ok(goal instanceof EBNF.ParseNodeGoal);
				assert_arrayLength(goal.children, 3, 'goal should have 3 children');
				const [sot, prod_list, eot]: readonly [Token, EBNF.ParseNodeGoal__0__List, Token] = goal.children;
				assert.ok(sot instanceof TokenFilebound);
				assert.ok(eot instanceof TokenFilebound);
				assert.deepStrictEqual(
					[sot.source,    eot.source],
					[Filebound.SOT, Filebound.EOT],
				);
				assert_arrayLength(prod_list.children, 2, 'outer production list should have 2 children');
				const [first, second]: readonly [EBNF.ParseNodeGoal__0__List, EBNF.ParseNodeProduction] = prod_list.children;
				assert_arrayLength(first.children, 1, 'inner production list should have 1 child');
				const prod: EBNF.ParseNodeProduction = first.children[0];
				assert.deepStrictEqual(
					[prod.source,                                      second.source],
					[`Unit ::= NUMBER | "(" OPERATOR Unit Unit ")" ;`, `Goal ::= #x02 Unit ? #x03 ;`],
				);
			});

			specify('Production ::= NonterminalName "::=" Definition ";";', () => {
				const prod: EBNF.ParseNodeProduction = (new ParserEBNF(`
					Unit ::=
						| NUMBER
						| "(" OPERATOR Unit Unit ")"
					;
				`).parse()
					.children[1] as EBNF.ParseNodeGoal__0__List)
					.children[0] as EBNF.ParseNodeProduction
				;
				/*
					<Production>
						<NonterminalName source="Unit">...<NonterminalName>
						<PUNCTUATOR>::=<PUNCTUATOR>
						<Definition source='| NUMBER | "(" OPERATOR Unit Unit ")"'>...<Definition>
						<PUNCTUATOR>;<PUNCTUATOR>
					</Production>
				*/
				assert_arrayLength(prod.children, 4, 'production should have 4 children');
				const children: readonly [EBNF.ParseNodeNonterminalName, Token, EBNF.ParseNodeDefinition, Token] = prod.children;
				assert.deepStrictEqual(
					children.map((c) => c.source),
					['Unit', '::=', '| NUMBER | "(" OPERATOR Unit Unit ")"', ';'],
				);
			});

			specify('Definition ::= "." Altern;', () => {
				const defn: EBNF.ParseNodeDefinition = ((new ParserEBNF(`
					Unit ::=
						. NUMBER | "(" OPERATOR Unit Unit ")"
					;
				`).parse()
					.children[1] as EBNF.ParseNodeGoal__0__List)
					.children[0] as EBNF.ParseNodeProduction)
					.children[2] as EBNF.ParseNodeDefinition
				;
				/*
					<Definition>
						<PUNCTUATOR>.<PUNCTUATOR>
						<Altern source='NUMBER | "(" OPERATOR Unit Unit ")"'>...</Altern>
					</Definition>
				*/
				assert_arrayLength(defn.children, 2, 'defn should have 2 children');
				const children: readonly [Token, EBNF.ParseNodeAltern] | readonly [EBNF.ParseNodeAltern, Token] = defn.children;
				assert.ok(children[0] instanceof Token);
				assert.ok(children[1] instanceof EBNF.ParseNodeAltern);
				assert.deepStrictEqual(
					children.map((c) => c.source),
					['.', 'NUMBER | "(" OPERATOR Unit Unit ")"'],
				);
			});

			specify('Definition ::= "&" Altern;', () => {
				const defn: EBNF.ParseNodeDefinition = ((new ParserEBNF(`
					Unit ::=
						& NUMBER | "(" OPERATOR Unit Unit ")"
					;
				`).parse()
					.children[1] as EBNF.ParseNodeGoal__0__List)
					.children[0] as EBNF.ParseNodeProduction)
					.children[2] as EBNF.ParseNodeDefinition
				;
				/*
					<Definition>
						<PUNCTUATOR>&<PUNCTUATOR>
						<Altern source='NUMBER | "(" OPERATOR Unit Unit ")"'>...</Altern>
					</Definition>
				*/
				assert_arrayLength(defn.children, 2, 'defn should have 2 children');
				const children: readonly [Token, EBNF.ParseNodeAltern] | readonly [EBNF.ParseNodeAltern, Token] = defn.children;
				assert.ok(children[0] instanceof Token);
				assert.ok(children[1] instanceof EBNF.ParseNodeAltern);
				assert.deepStrictEqual(
					children.map((c) => c.source),
					['&', 'NUMBER | "(" OPERATOR Unit Unit ")"'],
				);
			});

			specify('Definition ::= "|" Altern;', () => {
				const defn: EBNF.ParseNodeDefinition = ((new ParserEBNF(`
					Unit ::=
						| NUMBER
						| "(" OPERATOR Unit Unit ")"
					;
				`).parse()
					.children[1] as EBNF.ParseNodeGoal__0__List)
					.children[0] as EBNF.ParseNodeProduction)
					.children[2] as EBNF.ParseNodeDefinition
				;
				/*
					<Definition>
						<PUNCTUATOR>|<PUNCTUATOR>
						<Altern source='NUMBER | "(" OPERATOR Unit Unit ")"'>...</Altern>
					</Definition>
				*/
				assert_arrayLength(defn.children, 2, 'defn should have 2 children');
				const children: readonly [Token, EBNF.ParseNodeAltern] | readonly [EBNF.ParseNodeAltern, Token] = defn.children;
				assert.ok(children[0] instanceof Token);
				assert.ok(children[1] instanceof EBNF.ParseNodeAltern);
				assert.deepStrictEqual(
					children.map((c) => c.source),
					['|', 'NUMBER | "(" OPERATOR Unit Unit ")"'],
				);
			});

			specify('Altern ::= Altern "|" Concat;', () => {
				const altern: EBNF.ParseNodeAltern = (((new ParserEBNF(`
					Unit ::=
						| NUMBER
						| "(" OPERATOR Unit Unit ")"
					;
				`).parse()
					.children[1] as EBNF.ParseNodeGoal__0__List)
					.children[0] as EBNF.ParseNodeProduction)
					.children[2] as EBNF.ParseNodeDefinition)
					.children[1] as EBNF.ParseNodeAltern
				;
				/*
					<Altern>
						<Altern source="NUMBER">...<Altern>
						<PUNCTUATOR>|<PUNCTUATOR>
						<Concat source='"(" OPERATOR Unit Unit ")"'>...<Concat>
					</Altern>
				*/
				assert_arrayLength(altern.children, 3, 'altern should have 3 children');
				const children: readonly [EBNF.ParseNodeAltern, Token, EBNF.ParseNodeConcat] = altern.children;
				assert.deepStrictEqual(
					children.map((c) => c.source),
					['NUMBER', '|', '"(" OPERATOR Unit Unit ")"'],
				);
			});

			specify('Concat ::= Concat "&" Order;', () => {
				const concat: EBNF.ParseNodeConcat = ((((new ParserEBNF(`
					Unit ::=
						| NUMBER
						| NULL & "(" OPERATOR Unit Unit ")"
					;
				`).parse()
					.children[1] as EBNF.ParseNodeGoal__0__List)
					.children[0] as EBNF.ParseNodeProduction)
					.children[2] as EBNF.ParseNodeDefinition)
					.children[1] as EBNF.ParseNodeAltern)
					.children[2] as EBNF.ParseNodeConcat
				;
				/*
					<Concat>
						<Concat source="NULL">...<Concat>
						<PUNCTUATOR>&<PUNCTUATOR>
						<Order source='"(" OPERATOR Unit Unit ")"'>...<Order>
					</Concat>
				*/
				assert_arrayLength(concat.children, 3, 'concat should have 3 children');
				const children: readonly [EBNF.ParseNodeConcat, Token, EBNF.ParseNodeOrder] = concat.children;
				assert.deepStrictEqual(
					children.map((c) => c.source),
					['NULL', '&', '"(" OPERATOR Unit Unit ")"'],
				);
			});

			specify('Order ::= Order Item;', () => {
				const order: EBNF.ParseNodeOrder = (((((new ParserEBNF(`
					Unit ::=
						| NUMBER
						| "(" OPERATOR Unit Unit ")"
					;
				`).parse()
					.children[1] as EBNF.ParseNodeGoal__0__List)
					.children[0] as EBNF.ParseNodeProduction)
					.children[2] as EBNF.ParseNodeDefinition)
					.children[1] as EBNF.ParseNodeAltern)
					.children[2] as EBNF.ParseNodeConcat)
					.children[0] as EBNF.ParseNodeOrder
				;
				/*
					<Order>
						<Order source='"(" OPERATOR Unit Unit'>...<Order>
						<Item source='")"'>...<Item>
					</Order>
				*/
				assert_arrayLength(order.children, 2, 'order should have 2 children');
				const children: readonly [EBNF.ParseNodeOrder, EBNF.ParseNodeItem] = order.children;
				assert.deepStrictEqual(
					children.map((c) => c.source),
					['"(" OPERATOR Unit Unit', '")"'],
				);
			});
		});
	});
});

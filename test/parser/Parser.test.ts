import * as assert from 'assert';
import * as xjs from 'extrajs';
import {Filebound} from '../../src/utils';
import {
	Token,
	TokenFilebound,
} from '../../src/lexer/Token';
import type {ParseNode} from '../../src/parser/ParseNode';
import * as PARSENODE from '../../src/parser/parsenode/index';
import {Parser} from '../../src/parser/Parser';
import {PARSER} from '../../src/ebnf/Parser.auto';
import {
	ParseError01,
} from '../../src/error/ParseError';
import {
	assert_arrayLength,
} from '../helpers';
import {
	PARSENODE as PARSENODE_SAMPLE,
	PARSER as PARSER_SAMPLE,
} from '../sample/';



describe('Parser', () => {
	describe('.fromJSON', () => {
		it('returns a string representing a new subclass of Parser.', () => {
			assert.strictEqual(Parser.fromJSON([
				{
					name: 'Unit',
					defn: [
						[{term: 'NUMBER'}],
						['(', {term: 'OPERATOR'}, {prod: 'Unit'}, {prod: 'Unit'}, ')'],
					],
				},
				{
					name: 'Goal',
					defn: [
						['\\u0002',                 '\\u0003'],
						['\\u0002', {prod: 'Unit'}, '\\u0003'],
					],
				},
			]), (xjs.String.dedent`
				export const PARSER: Parser<ParseNodeGoal> = new Parser<ParseNodeGoal>(
					LEXER,
					GRAMMAR,
					new Map<Production, typeof ParseNode>([
						[ProductionUnit.instance, ParseNodeUnit],
						[ProductionGoal.instance, ParseNodeGoal],
					]),
				);
			`));
		});
	});

	describe('#parse', () => {
		context('Goal ::= #x02 #x03', () => {
			it('returns only file bounds.', () => {
				const tree: ParseNode = PARSER_SAMPLE.parse(``);
				assert.strictEqual(tree.children.length, 2);
				tree.children.forEach((child) => assert.ok(child instanceof TokenFilebound));
			});
		});

		it('rejects unexpected tokens.', () => {
			assert.throws(() => PARSER_SAMPLE.parse(`(+ 3 4 5)`), ParseError01);
		});

		describe('ParserSample', () => {
			specify('Goal ::= #x02 Unit #x03;', () => {
				const goal: ParseNode = PARSER_SAMPLE.parse(`(+ (* 2 3) 5)`);
				/*
					<Goal>
						<FILEBOUND>␂</FILEBOUND>
						<Unit src="(+ (* 2 3) 5)">...</Unit>
						<FILEBOUND>␃</FILEBOUND>
					</Goal>
				*/
				assert.ok(goal instanceof PARSENODE_SAMPLE.ParseNodeGoal);
				assert_arrayLength(goal.children, 3, 'goal should have 3 children');
				const [sot, unit, eot]: readonly [Token, PARSENODE_SAMPLE.ParseNodeUnit, Token] = goal.children;
				assert.deepStrictEqual(
					[sot.source,    unit.source,         eot.source],
					[Filebound.SOT, `( + ( * 2 3 ) 5 )`, Filebound.EOT],
				);
			});

			specify('Unit ::= "(" OPERATOR Unit Unit ")";', () => {
				const unit: PARSENODE_SAMPLE.ParseNodeUnit = PARSER_SAMPLE.parse(`(+ (* 2 3) 5)`).children[1] as PARSENODE_SAMPLE.ParseNodeUnit;
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
				const [open, op, left, right, close]: readonly [Token, Token, PARSENODE_SAMPLE.ParseNodeUnit, PARSENODE_SAMPLE.ParseNodeUnit, Token] = unit.children;
				assert.deepStrictEqual(
					[open.source, op.source, left.source, right.source, close.source],
					[`(`,         `+`,       `( * 2 3 )`, `5`,          `)`],
				);
			});
		});

		describe('ParserEBNF', () => {
			specify('Goal ::= #x02 Production* #x03;', () => {
				const goal: ParseNode = PARSER.parse(`
					Unit ::= NUMBER | "(" OPERATOR Unit Unit ")";
					Goal ::= #x02 Unit? #x03;
				`);
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
				assert.ok(goal instanceof PARSENODE.ParseNodeGoal);
				assert_arrayLength(goal.children, 3, 'goal should have 3 children');
				const [sot, prod_list, eot]: readonly [Token, PARSENODE.ParseNodeGoal__0__List, Token] = goal.children;
				assert.ok(sot instanceof TokenFilebound);
				assert.ok(eot instanceof TokenFilebound);
				assert.deepStrictEqual(
					[sot.source,    eot.source],
					[Filebound.SOT, Filebound.EOT],
				);
				assert_arrayLength(prod_list.children, 2, 'outer production list should have 2 children');
				const [first, second]: readonly [PARSENODE.ParseNodeGoal__0__List, PARSENODE.ParseNodeProduction] = prod_list.children;
				assert_arrayLength(first.children, 1, 'inner production list should have 1 child');
				const prod: PARSENODE.ParseNodeProduction = first.children[0];
				assert.deepStrictEqual(
					[prod.source,                                      second.source],
					[`Unit ::= NUMBER | "(" OPERATOR Unit Unit ")" ;`, `Goal ::= #x02 Unit ? #x03 ;`],
				);
			});

			specify('Production ::= NonterminalName "::=" Definition ";";', () => {
				const prod: PARSENODE.ParseNodeProduction = (PARSER.parse(`
					Unit ::=
						| NUMBER
						| "(" OPERATOR Unit Unit ")"
					;
				`)
					.children[1] as PARSENODE.ParseNodeGoal__0__List)
					.children[0] as PARSENODE.ParseNodeProduction
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
				const children: readonly [PARSENODE.ParseNodeNonterminalName, Token, PARSENODE.ParseNodeDefinition, Token] = prod.children;
				assert.deepStrictEqual(
					children.map((c) => c.source),
					['Unit', '::=', '| NUMBER | "(" OPERATOR Unit Unit ")"', ';'],
				);
			});

			specify('Definition ::= "." Altern;', () => {
				const defn: PARSENODE.ParseNodeDefinition = ((PARSER.parse(`
					Unit ::=
						. NUMBER | "(" OPERATOR Unit Unit ")"
					;
				`)
					.children[1] as PARSENODE.ParseNodeGoal__0__List)
					.children[0] as PARSENODE.ParseNodeProduction)
					.children[2] as PARSENODE.ParseNodeDefinition
				;
				/*
					<Definition>
						<PUNCTUATOR>.<PUNCTUATOR>
						<Altern source='NUMBER | "(" OPERATOR Unit Unit ")"'>...</Altern>
					</Definition>
				*/
				assert_arrayLength(defn.children, 2, 'defn should have 2 children');
				const children: readonly [Token, PARSENODE.ParseNodeAltern] | readonly [PARSENODE.ParseNodeAltern, Token] = defn.children;
				assert.ok(children[0] instanceof Token);
				assert.ok(children[1] instanceof PARSENODE.ParseNodeAltern);
				assert.deepStrictEqual(
					children.map((c) => c.source),
					['.', 'NUMBER | "(" OPERATOR Unit Unit ")"'],
				);
			});

			specify('Definition ::= "&" Altern;', () => {
				const defn: PARSENODE.ParseNodeDefinition = ((PARSER.parse(`
					Unit ::=
						& NUMBER | "(" OPERATOR Unit Unit ")"
					;
				`)
					.children[1] as PARSENODE.ParseNodeGoal__0__List)
					.children[0] as PARSENODE.ParseNodeProduction)
					.children[2] as PARSENODE.ParseNodeDefinition
				;
				/*
					<Definition>
						<PUNCTUATOR>&<PUNCTUATOR>
						<Altern source='NUMBER | "(" OPERATOR Unit Unit ")"'>...</Altern>
					</Definition>
				*/
				assert_arrayLength(defn.children, 2, 'defn should have 2 children');
				const children: readonly [Token, PARSENODE.ParseNodeAltern] | readonly [PARSENODE.ParseNodeAltern, Token] = defn.children;
				assert.ok(children[0] instanceof Token);
				assert.ok(children[1] instanceof PARSENODE.ParseNodeAltern);
				assert.deepStrictEqual(
					children.map((c) => c.source),
					['&', 'NUMBER | "(" OPERATOR Unit Unit ")"'],
				);
			});

			specify('Definition ::= "|" Altern;', () => {
				const defn: PARSENODE.ParseNodeDefinition = ((PARSER.parse(`
					Unit ::=
						| NUMBER
						| "(" OPERATOR Unit Unit ")"
					;
				`)
					.children[1] as PARSENODE.ParseNodeGoal__0__List)
					.children[0] as PARSENODE.ParseNodeProduction)
					.children[2] as PARSENODE.ParseNodeDefinition
				;
				/*
					<Definition>
						<PUNCTUATOR>|<PUNCTUATOR>
						<Altern source='NUMBER | "(" OPERATOR Unit Unit ")"'>...</Altern>
					</Definition>
				*/
				assert_arrayLength(defn.children, 2, 'defn should have 2 children');
				const children: readonly [Token, PARSENODE.ParseNodeAltern] | readonly [PARSENODE.ParseNodeAltern, Token] = defn.children;
				assert.ok(children[0] instanceof Token);
				assert.ok(children[1] instanceof PARSENODE.ParseNodeAltern);
				assert.deepStrictEqual(
					children.map((c) => c.source),
					['|', 'NUMBER | "(" OPERATOR Unit Unit ")"'],
				);
			});

			specify('Altern ::= Altern "|" Concat;', () => {
				const altern: PARSENODE.ParseNodeAltern = (((PARSER.parse(`
					Unit ::=
						| NUMBER
						| "(" OPERATOR Unit Unit ")"
					;
				`)
					.children[1] as PARSENODE.ParseNodeGoal__0__List)
					.children[0] as PARSENODE.ParseNodeProduction)
					.children[2] as PARSENODE.ParseNodeDefinition)
					.children[1] as PARSENODE.ParseNodeAltern
				;
				/*
					<Altern>
						<Altern source="NUMBER">...<Altern>
						<PUNCTUATOR>|<PUNCTUATOR>
						<Concat source='"(" OPERATOR Unit Unit ")"'>...<Concat>
					</Altern>
				*/
				assert_arrayLength(altern.children, 3, 'altern should have 3 children');
				const children: readonly [PARSENODE.ParseNodeAltern, Token, PARSENODE.ParseNodeConcat] = altern.children;
				assert.deepStrictEqual(
					children.map((c) => c.source),
					['NUMBER', '|', '"(" OPERATOR Unit Unit ")"'],
				);
			});

			specify('Concat ::= Concat "&" Order;', () => {
				const concat: PARSENODE.ParseNodeConcat = ((((PARSER.parse(`
					Unit ::=
						| NUMBER
						| NULL & "(" OPERATOR Unit Unit ")"
					;
				`)
					.children[1] as PARSENODE.ParseNodeGoal__0__List)
					.children[0] as PARSENODE.ParseNodeProduction)
					.children[2] as PARSENODE.ParseNodeDefinition)
					.children[1] as PARSENODE.ParseNodeAltern)
					.children[2] as PARSENODE.ParseNodeConcat
				;
				/*
					<Concat>
						<Concat source="NULL">...<Concat>
						<PUNCTUATOR>&<PUNCTUATOR>
						<Order source='"(" OPERATOR Unit Unit ")"'>...<Order>
					</Concat>
				*/
				assert_arrayLength(concat.children, 3, 'concat should have 3 children');
				const children: readonly [PARSENODE.ParseNodeConcat, Token, PARSENODE.ParseNodeOrder] = concat.children;
				assert.deepStrictEqual(
					children.map((c) => c.source),
					['NULL', '&', '"(" OPERATOR Unit Unit ")"'],
				);
			});

			specify('Order ::= Order Item;', () => {
				const order: PARSENODE.ParseNodeOrder = (((((PARSER.parse(`
					Unit ::=
						| NUMBER
						| "(" OPERATOR Unit Unit ")"
					;
				`)
					.children[1] as PARSENODE.ParseNodeGoal__0__List)
					.children[0] as PARSENODE.ParseNodeProduction)
					.children[2] as PARSENODE.ParseNodeDefinition)
					.children[1] as PARSENODE.ParseNodeAltern)
					.children[2] as PARSENODE.ParseNodeConcat)
					.children[0] as PARSENODE.ParseNodeOrder
				;
				/*
					<Order>
						<Order source='"(" OPERATOR Unit Unit'>...<Order>
						<Item source='")"'>...<Item>
					</Order>
				*/
				assert_arrayLength(order.children, 2, 'order should have 2 children');
				const children: readonly [PARSENODE.ParseNodeOrder, PARSENODE.ParseNodeItem] = order.children;
				assert.deepStrictEqual(
					children.map((c) => c.source),
					['"(" OPERATOR Unit Unit', '")"'],
				);
			});
		});
	});
});

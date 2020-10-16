import * as assert from 'assert';

import type {
	EBNFChoice,
} from '../../src/types.d';
import type {ParseNode} from '../../src/parser/ParseNode';
import {ASTNode} from '../../src/validator/ASTNode';
import {
	ASTNODE,
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

	describe('ASTNodeExpr', () => {
		describe('#transform', () => {
			describe('ASTNodeRef', () => {
				function makeProductionDefn(ebnf: string): EBNFChoice {
					return Decorator.decorate(new ParserEBNF(ebnf).parse()).children[0].transform()[0].defn;
				}
				it('returns a terminal for a MACRO_CASE identifier.', () => {
					assert.deepStrictEqual(
						makeProductionDefn(`
							Alpha ::= ALPHA;
						`),
						[
							[{term: 'ALPHA'}],
						],
					);
				});
				it('returns a production for a TitleCase identifier, no arguments.', () => {
					assert.deepStrictEqual(
						makeProductionDefn(`
							Beta ::= Bravo;
						`),
						[
							[{prod: 'Bravo'}],
						],
					);
				});
				it('appends arguments for a TitleCase identifier, with single argument.', () => {
					assert.deepStrictEqual(
						makeProductionDefn(`
							Gamma ::=
								  Charlie0<+Cee>
								. Charlie1<-Dee>
							;
						`),
						[
							[{prod: 'Charlie0_Cee'}, {prod: 'Charlie1'}],
						],
					);
				});
			});
		});
	});

	describe('ASTNodeNonterminal', () => {
		describe('#expand', () => {
			it('spilts into several names.', () => {
				assert.deepStrictEqual(
					Decorator.decorate(new ParserEBNF(`
						NonTerm<Param> ::= TERM;
					`).parse()).children[0].children[0].expand().map((cn) => cn.toString()),
					['NonTerm', 'NonTerm_Param'],
				);
			});
		});
	});

	describe('ASTNodeProduction', () => {
		describe('#transform', () => {
			it('spilts nonterminal parameters into several productions.', () => {
				const prod: ASTNODE.ASTNodeProduction = Decorator.decorate(new ParserEBNF(`
					NonTerm<Param> ::= TERM;
				`).parse()).children[0]
				assert.deepStrictEqual(prod.transform(), JSON.parse(`
					[
						{
							"name": "${ prod.children[0].expand()[0].toString() }",
							"defn": [
								[{"term": "TERM"}]
							]
						},
						{
							"name": "${ prod.children[0].expand()[1].toString() }",
							"defn": [
								[{"term": "TERM"}]
							]
						}
					]
				`));
			});
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

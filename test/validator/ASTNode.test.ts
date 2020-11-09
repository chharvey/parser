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

	context('ASTNODE imports from ebnf', () => {
		describe('ASTNODE.ASTNodeExpr', () => {
			describe('#transform', () => {
				describe('ASTNODE.ASTNodeRef', () => {
					function makeProductionDefn(ebnf: string): EBNFChoice {
						return Decorator.decorate(new ParserEBNF(ebnf).parse()).children[0].transform()[0].defn;
					}
					it('returns a terminal for a MACRO_CASE identifier.', () => {
						assert.deepStrictEqual(makeProductionDefn(`
							Alpha ::= ALPHA;
						`), [
							[{term: 'ALPHA'}],
						]);
					});
					it('returns a production for a TitleCase identifier, no arguments.', () => {
						assert.deepStrictEqual(makeProductionDefn(`
							Beta ::= Bravo;
						`), [
							[{prod: 'Bravo'}],
						]);
					});
					it('appends arguments for a TitleCase identifier, with single argument.', () => {
						assert.deepStrictEqual(makeProductionDefn(`
							Gamma ::=
								  Charlie0<+Cee>
								. Charlie1<-Dee>
							;
						`), [
							[{prod: 'Charlie0_Cee'}, {prod: 'Charlie1'}],
						]);
					});
					it('appends arguments for a TitleCase identifier, with multiple arguments.', () => {
						assert.deepStrictEqual([
							makeProductionDefn(`Delta ::= Delta0<+Eee, +Eff>;`),
							makeProductionDefn(`Delta ::= Delta1<+Eee, -Eff>;`),
							makeProductionDefn(`Delta ::= Delta2<-Eee, +Eff>;`),
							makeProductionDefn(`Delta ::= Delta3<-Eee, -Eff>;`),
						], [
							[
								[{prod: 'Delta0_Eff'}],
								[{prod: 'Delta0_Eee'}],
								[{prod: 'Delta0_Eee_Eff'}],
							],
							[
								[{prod: 'Delta1'}],
								[{prod: 'Delta1_Eee'}],
								[{prod: 'Delta1_Eee'}],
							],
							[
								[{prod: 'Delta2_Eff'}],
								[{prod: 'Delta2'}],
								[{prod: 'Delta2_Eff'}],
							],
							[
								[{prod: 'Delta3'}],
								[{prod: 'Delta3'}],
								[{prod: 'Delta3'}],
							],
						]);
						assert.deepStrictEqual([
							makeProductionDefn(`Epsilon ::= Echo0<+Eee, +Eff, +Gee>;`),
							makeProductionDefn(`Epsilon ::= Echo1<+Eee, +Eff, -Gee>;`),
							makeProductionDefn(`Epsilon ::= Echo2<+Eee, -Eff, +Gee>;`),
							makeProductionDefn(`Epsilon ::= Echo3<+Eee, -Eff, -Gee>;`),
							makeProductionDefn(`Epsilon ::= Echo4<-Eee, +Eff, +Gee>;`),
							makeProductionDefn(`Epsilon ::= Echo5<-Eee, +Eff, -Gee>;`),
							makeProductionDefn(`Epsilon ::= Echo6<-Eee, -Eff, +Gee>;`),
							makeProductionDefn(`Epsilon ::= Echo7<-Eee, -Eff, -Gee>;`),
						], [
							[
								[{prod: 'Echo0_Gee'}],
								[{prod: 'Echo0_Eff'}],
								[{prod: 'Echo0_Eff_Gee'}],
								[{prod: 'Echo0_Eee'}],
								[{prod: 'Echo0_Eee_Gee'}],
								[{prod: 'Echo0_Eee_Eff'}],
								[{prod: 'Echo0_Eee_Eff_Gee'}],
							],
							[
								[{prod: 'Echo1'}],
								[{prod: 'Echo1_Eff'}],
								[{prod: 'Echo1_Eff'}],
								[{prod: 'Echo1_Eee'}],
								[{prod: 'Echo1_Eee'}],
								[{prod: 'Echo1_Eee_Eff'}],
								[{prod: 'Echo1_Eee_Eff'}],
							],
							[
								[{prod: 'Echo2_Gee'}],
								[{prod: 'Echo2'}],
								[{prod: 'Echo2_Gee'}],
								[{prod: 'Echo2_Eee'}],
								[{prod: 'Echo2_Eee_Gee'}],
								[{prod: 'Echo2_Eee'}],
								[{prod: 'Echo2_Eee_Gee'}],
							],
							[
								[{prod: 'Echo3'}],
								[{prod: 'Echo3'}],
								[{prod: 'Echo3'}],
								[{prod: 'Echo3_Eee'}],
								[{prod: 'Echo3_Eee'}],
								[{prod: 'Echo3_Eee'}],
								[{prod: 'Echo3_Eee'}],
							],
							[
								[{prod: 'Echo4_Gee'}],
								[{prod: 'Echo4_Eff'}],
								[{prod: 'Echo4_Eff_Gee'}],
								[{prod: 'Echo4'}],
								[{prod: 'Echo4_Gee'}],
								[{prod: 'Echo4_Eff'}],
								[{prod: 'Echo4_Eff_Gee'}],
							],
							[
								[{prod: 'Echo5'}],
								[{prod: 'Echo5_Eff'}],
								[{prod: 'Echo5_Eff'}],
								[{prod: 'Echo5'}],
								[{prod: 'Echo5'}],
								[{prod: 'Echo5_Eff'}],
								[{prod: 'Echo5_Eff'}],
							],
							[
								[{prod: 'Echo6_Gee'}],
								[{prod: 'Echo6'}],
								[{prod: 'Echo6_Gee'}],
								[{prod: 'Echo6'}],
								[{prod: 'Echo6_Gee'}],
								[{prod: 'Echo6'}],
								[{prod: 'Echo6_Gee'}],
							],
							[
								[{prod: 'Echo7'}],
								[{prod: 'Echo7'}],
								[{prod: 'Echo7'}],
								[{prod: 'Echo7'}],
								[{prod: 'Echo7'}],
								[{prod: 'Echo7'}],
								[{prod: 'Echo7'}],
							],
						]);
					});
					it('appends arguments for a TitleCase identifier, with multiple argument sets.', () => {
						assert.deepStrictEqual([
							makeProductionDefn(`Zeta ::= Foxtrot0<+Ach><+Eye>;`),
							makeProductionDefn(`Zeta ::= Foxtrot1<+Ach><-Eye>;`),
							makeProductionDefn(`Zeta ::= Foxtrot2<-Ach><+Eye>;`),
							makeProductionDefn(`Zeta ::= Foxtrot3<-Ach><-Eye>;`),
						], [
							[
								[{prod: 'Foxtrot0_Ach_Eye'}],
							],
							[
								[{prod: 'Foxtrot1_Ach'}],
							],
							[
								[{prod: 'Foxtrot2_Eye'}],
							],
							[
								[{prod: 'Foxtrot3'}],
							],
						]);
						assert.deepStrictEqual([
							makeProductionDefn(`Eta ::= Golf0<+Jay><+Kay><+Ell>;`),
							makeProductionDefn(`Eta ::= Golf1<+Jay><+Kay><-Ell>;`),
							makeProductionDefn(`Eta ::= Golf2<+Jay><-Kay><+Ell>;`),
							makeProductionDefn(`Eta ::= Golf3<+Jay><-Kay><-Ell>;`),
							makeProductionDefn(`Eta ::= Golf4<-Jay><+Kay><+Ell>;`),
							makeProductionDefn(`Eta ::= Golf5<-Jay><+Kay><-Ell>;`),
							makeProductionDefn(`Eta ::= Golf6<-Jay><-Kay><+Ell>;`),
							makeProductionDefn(`Eta ::= Golf7<-Jay><-Kay><-Ell>;`),
						], [
							[
								[{prod: 'Golf0_Jay_Kay_Ell'}],
							],
							[
								[{prod: 'Golf1_Jay_Kay'}],
							],
							[
								[{prod: 'Golf2_Jay_Ell'}],
							],
							[
								[{prod: 'Golf3_Jay'}],
							],
							[
								[{prod: 'Golf4_Kay_Ell'}],
							],
							[
								[{prod: 'Golf5_Kay'}],
							],
							[
								[{prod: 'Golf6_Ell'}],
							],
							[
								[{prod: 'Golf7'}],
							],
						]);
					});
				});

				describe('ASTNODE.ASTNodeItem', () => {
					it('includes the item if one of the conditions is met.', () => {
						assert.deepStrictEqual(Decorator.decorate(new ParserEBNF(`
							Nonterm<Param> ::= <Param+>TERM "literal";
						`).parse()).transform(), [
							{
								name: 'Nonterm',
								defn: [
									['literal'],
								],
							},
							{
								name: 'Nonterm_Param',
								defn: [
									[{term: 'TERM'}, 'literal'],
								],
							},
						]);
						assert.deepStrictEqual(Decorator.decorate(new ParserEBNF(`
							Nonterm<Param> ::= <Param+, Par+>TERM "literal";
						`).parse()).transform(), [
							{
								name: 'Nonterm',
								defn: [
									['literal'],
								],
							},
							{
								name: 'Nonterm_Param',
								defn: [
									[{term: 'TERM'}, 'literal'],
								],
							},
						]);
					});
					it('includes the item if nested and all conditions are met.', () => {
						assert.deepStrictEqual(Decorator.decorate(new ParserEBNF(`
							Nonterm<Param, Par> ::= <Param+><Par+>TERM "literal";
						`).parse()).transform(), [
							{
								name: 'Nonterm',
								defn: [
									['literal'],
								],
							},
							{
								name: 'Nonterm_Par',
								defn: [
									['literal'],
								],
							},
							{
								name: 'Nonterm_Param',
								defn: [
									['literal'],
								],
							},
							{
								name: 'Nonterm_Param_Par',
								defn: [
									[{term: 'TERM'}, 'literal'],
								],
							},
						]);
					});
					it('does not include the item if all conditions are not met.', () => {
						assert.deepStrictEqual(Decorator.decorate(new ParserEBNF(`
							Nonterm<Par> ::= <Param+>TERM "literal";
						`).parse()).transform(), [
							{
								name: 'Nonterm',
								defn: [
									['literal'],
								],
							},
							{
								name: 'Nonterm_Par',
								defn: [
									['literal'],
								],
							},
						]);
					});
					it('anti-includes the item if negated condition.', () => {
						assert.deepStrictEqual(Decorator.decorate(new ParserEBNF(`
							Nonterm<Param> ::= <Param->TERM "literal";
						`).parse()).transform(), [
							{
								name: 'Nonterm',
								defn: [
									[{term: 'TERM'}, 'literal'],
								],
							},
							{
								name: 'Nonterm_Param',
								defn: [
									['literal'],
								],
							},
						]);
					});
				});
			});
		});

		describe('ASTNODE.ASTNodeNonterminal', () => {
			describe('#expand', () => {
				function testExpand(ebnf: string): string[] {
					return Decorator.decorate(new ParserEBNF(ebnf).parse())
						.children[0]
						.children[0]
						.expand().map((cn) => cn.toString())
					;
				}
				it('if no params, returns the nonterminal name.', () => {
					assert.deepStrictEqual(testExpand(`
						NonTerm ::= TERM;
					`), [
						'NonTerm',
					]);
				});
				it('with param, spilts into several names.', () => {
					assert.deepStrictEqual(testExpand(`
						NonTerm<Param> ::= TERM;
					`), [
						'NonTerm',
						'NonTerm_Param',
					]);
				});
				it('expands combinatorially for multiple params in a set.', () => {
					assert.deepStrictEqual([
						testExpand(`
							NonTerm<Param1, Param2> ::= TERM;
						`),
						testExpand(`
							NonTerm<Param1, Param2, Param3> ::= TERM;
						`),
					], [
						[
							'NonTerm',
							'NonTerm_Param2',
							'NonTerm_Param1',
							'NonTerm_Param1_Param2',
						],
						[
							'NonTerm',
							'NonTerm_Param3',
							'NonTerm_Param2',
							'NonTerm_Param2_Param3',
							'NonTerm_Param1',
							'NonTerm_Param1_Param3',
							'NonTerm_Param1_Param2',
							'NonTerm_Param1_Param2_Param3',
						],
					]);
				});
				it('expands combinatorially for multiple param sets.', () => {
					assert.deepStrictEqual([
						testExpand(`
							NonTerm<Param1><Param2> ::= TERM;
						`),
						testExpand(`
							NonTerm<Param1><Param2><Param3> ::= TERM;
						`),
					], [
						[
							'NonTerm',
							'NonTerm_Param2',
							'NonTerm_Param1',
							'NonTerm_Param1_Param2',
						],
						[
							'NonTerm',
							'NonTerm_Param3',
							'NonTerm_Param2',
							'NonTerm_Param2_Param3',
							'NonTerm_Param1',
							'NonTerm_Param1_Param3',
							'NonTerm_Param1_Param2',
							'NonTerm_Param1_Param2_Param3',
						],
					]);
				});
			});
		});

		describe('ASTNODE.ASTNodeProduction', () => {
			describe('#transform', () => {
				it('spilts nonterminal parameters into several productions.', () => {
					const prod: ASTNODE.ASTNodeProduction = Decorator.decorate(new ParserEBNF(`
						NonTerm<Param> ::= TERM;
					`).parse()).children[0]
					assert.deepStrictEqual(prod.transform(), [
						{
							name: prod.children[0].expand()[0].toString(),
							defn: [
								[{term: 'TERM'}],
							],
						},
						{
							name: prod.children[0].expand()[1].toString(),
							defn: [
								[{term: 'TERM'}],
							],
						},
					]);
				});

				it('generates different list productions for different params.', () => {
					const prod: ASTNODE.ASTNodeProduction = Decorator.decorate(new ParserEBNF(`
						NonTerm<Param> ::= TERM+;
					`).parse()).children[0];
					assert.deepStrictEqual(prod.transform(), [
						{
							name: `${ prod.children[0].expand()[0] }__0__List`,
							defn: [
								[{term: 'TERM'}],
								[{prod: `${ prod.children[0].expand()[0] }__0__List`}, {term: 'TERM'}],
							],
						},
						{
							name: `${ prod.children[0].expand()[1] }__0__List`,
							defn: [
								[{term: 'TERM'}],
								[{prod: `${ prod.children[0].expand()[1] }__0__List`}, {term: 'TERM'}],
							],
						},
						{
							name: prod.children[0].expand()[0].toString(),
							defn: [
								[{prod: `${ prod.children[0].expand()[0] }__0__List`}],
							],
						},
						{
							name: prod.children[0].expand()[1].toString(),
							defn: [
								[{prod: `${ prod.children[0].expand()[1] }__0__List`}],
							],
						},
					]);
				});
			});
		});

		describe('ASTNODE.ASTNodeGoal', () => {
			describe('#transform', () => {
				specify('SemanticGoal ::= SemanticProduction*;', () => {
					assert.deepStrictEqual(Decorator.decorate(new ParserEBNF(`
						Unit ::= NUMBER | "(" OPERATOR Unit Unit ")";
						Goal ::= #x02 Unit? #x03;
					`).parse()).transform(), [
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
					]);
				});
			});
		});
	});
});

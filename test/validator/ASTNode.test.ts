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
	ParserSample,
	PARSER as PARSERSAMPLE,
} from '../sample';



describe('ASTNode', () => {
	describe('#serialize', () => {
		it('prints a readable string.', () => {
			const tree: ParseNode = new ParserSample(`(+ (* 2 3) 5)`).parse();
			const add:   PARSERSAMPLE.ParseNodeUnit = tree.children[1] as PARSERSAMPLE.ParseNodeUnit;
			const mult:  PARSERSAMPLE.ParseNodeUnit = add .children[2] as PARSERSAMPLE.ParseNodeUnit;
			const five:  PARSERSAMPLE.ParseNodeUnit = add .children[3] as PARSERSAMPLE.ParseNodeUnit;
			const two:   PARSERSAMPLE.ParseNodeUnit = mult.children[2] as PARSERSAMPLE.ParseNodeUnit;
			const three: PARSERSAMPLE.ParseNodeUnit = mult.children[3] as PARSERSAMPLE.ParseNodeUnit;
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
				function makeProductionDefn(ebnf: string): EBNFChoice {
					return Decorator.decorate(new ParserEBNF(ebnf).parse()).children[0].transform()[0].defn;
				}

				describe('ASTNODE.ASTNodeConst', () => {
					it('returns a string for a string.', () => {
						assert.deepStrictEqual(makeProductionDefn(`
							Alpha ::= "omega";
						`), [
							['omega'],
						]);
					});
				});

				describe('ASTNODE.ASTNodeRef', () => {
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
								. Charlie0<+Cee>
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
							],
							[
								[{prod: 'Delta2'}],
								[{prod: 'Delta2_Eff'}],
							],
							[
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
								[{prod: 'Echo1_Eee'}],
								[{prod: 'Echo1_Eee_Eff'}],
							],
							[
								[{prod: 'Echo2'}],
								[{prod: 'Echo2_Gee'}],
								[{prod: 'Echo2_Eee'}],
								[{prod: 'Echo2_Eee_Gee'}],
							],
							[
								[{prod: 'Echo3'}],
								[{prod: 'Echo3_Eee'}],
							],
							[
								[{prod: 'Echo4'}],
								[{prod: 'Echo4_Gee'}],
								[{prod: 'Echo4_Eff'}],
								[{prod: 'Echo4_Eff_Gee'}],
							],
							[
								[{prod: 'Echo5'}],
								[{prod: 'Echo5_Eff'}],
							],
							[
								[{prod: 'Echo6'}],
								[{prod: 'Echo6_Gee'}],
							],
							[
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
								name: 'Nonterm$',
								family: true,
								defn: [
									['literal'],
									[{term: 'TERM'}, 'literal'],
								],
							},
							{
								name: 'Nonterm',
								family: 'Nonterm$',
								defn: [
									['literal'],
								],
							},
							{
								name: 'Nonterm_Param',
								family: 'Nonterm$',
								defn: [
									[{term: 'TERM'}, 'literal'],
								],
							},
						]);
						assert.deepStrictEqual(Decorator.decorate(new ParserEBNF(`
							Nonterm<Param> ::= <Param+, Par+>TERM "literal";
						`).parse()).transform(), [
							{
								name: 'Nonterm$',
								family: true,
								defn: [
									['literal'],
									[{term: 'TERM'}, 'literal'],
								],
							},
							{
								name: 'Nonterm',
								family: 'Nonterm$',
								defn: [
									['literal'],
								],
							},
							{
								name: 'Nonterm_Param',
								family: 'Nonterm$',
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
								name: 'Nonterm$',
								family: true,
								defn: [
									['literal'],
									['literal'],
									['literal'],
									[{term: 'TERM'}, 'literal'],
								],
							},
							{
								name: 'Nonterm',
								family: 'Nonterm$',
								defn: [
									['literal'],
								],
							},
							{
								name: 'Nonterm_Par',
								family: 'Nonterm$',
								defn: [
									['literal'],
								],
							},
							{
								name: 'Nonterm_Param',
								family: 'Nonterm$',
								defn: [
									['literal'],
								],
							},
							{
								name: 'Nonterm_Param_Par',
								family: 'Nonterm$',
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
								name: 'Nonterm$',
								family: true,
								defn: [
									['literal'],
									['literal'],
								],
							},
							{
								name: 'Nonterm',
								family: 'Nonterm$',
								defn: [
									['literal'],
								],
							},
							{
								name: 'Nonterm_Par',
								family: 'Nonterm$',
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
								name: 'Nonterm$',
								family: true,
								defn: [
									[{term: 'TERM'}, 'literal'],
									['literal'],
								],
							},
							{
								name: 'Nonterm',
								family: 'Nonterm$',
								defn: [
									[{term: 'TERM'}, 'literal'],
								],
							},
							{
								name: 'Nonterm_Param',
								family: 'Nonterm$',
								defn: [
									['literal'],
								],
							},
						]);
					});
				});

				describe('ASTNODE.ASTNodeOpUn[operator=PLUS]', () => {
					it('creates a new production with __0__List appended to the name.', () => {
						assert.deepStrictEqual(Decorator.decorate(new ParserEBNF(`
							NonTerm ::= ALPHA BETA+ GAMMA;
						`).parse()).children[0].transform(), [
							{
								name: 'NonTerm__0__List',
								defn: [
									[{term: 'BETA'}],
									[{prod: 'NonTerm__0__List'}, {term: 'BETA'}],
								],
							},
							{
								name: 'NonTerm',
								defn: [
									[{term: 'ALPHA'}, {prod: 'NonTerm__0__List'}, {term: 'GAMMA'}],
								],
							},
						]);
					});
					it('memoizes reusable plus-lists.', () => {
						assert.deepStrictEqual(Decorator.decorate(new ParserEBNF(`
							Alpha ::= BETA GAMMA+;
							Delta ::= GAMMA+ EPSILON;
						`).parse()).transform(), [
							{
								name: 'Alpha__0__List',
								defn: [
									[                          {term: 'GAMMA'}],
									[{prod: 'Alpha__0__List'}, {term: 'GAMMA'}],
								],
							},
							{
								name: 'Alpha',
								defn: [
									[{term: 'BETA'}, {prod: 'Alpha__0__List'}],
								],
							},
							{
								name: 'Delta',
								defn: [
									[{prod: 'Alpha__0__List'}, {term: 'EPSILON'}],
								],
							},
						]);
					});
				});

				describe('ASTNODE.ASTNodeOpUn[operator=HASH]', () => {
					it('creates a new production with __0__List appended to the name.', () => {
						assert.deepStrictEqual(Decorator.decorate(new ParserEBNF(`
							NonTerm ::= ALPHA BETA# GAMMA;
						`).parse()).children[0].transform(), [
							{
								name: 'NonTerm__0__List',
								defn: [
									[{term: 'BETA'}],
									[{prod: 'NonTerm__0__List'}, ',', {term: 'BETA'}],
								],
							},
							{
								name: 'NonTerm',
								defn: [
									[{term: 'ALPHA'}, {prod: 'NonTerm__0__List'}, {term: 'GAMMA'}],
								],
							},
						]);
					});
					it('memoizes reusable hash-lists.', () => {
						assert.deepStrictEqual(Decorator.decorate(new ParserEBNF(`
							Alpha ::= BETA GAMMA#;
							Delta ::= GAMMA# EPSILON;
						`).parse()).transform(), [
							{
								name: 'Alpha__0__List',
								defn: [
									[                               {term: 'GAMMA'}],
									[{prod: 'Alpha__0__List'}, ',', {term: 'GAMMA'}],
								],
							},
							{
								name: 'Alpha',
								defn: [
									[{term: 'BETA'}, {prod: 'Alpha__0__List'}],
								],
							},
							{
								name: 'Delta',
								defn: [
									[{prod: 'Alpha__0__List'}, {term: 'EPSILON'}],
								],
							},
						]);
					});
				});

				specify('ASTNODE.ASTNodeOpUn[operator=OPT]', () => {
					assert.deepStrictEqual(Decorator.decorate(new ParserEBNF(`
						NonTerm ::= ALPHA BETA? GAMMA;
					`).parse()).children[0].transform(), [
						{
							name: 'NonTerm',
							defn: [
								[{term: 'ALPHA'},                 {term: 'GAMMA'}],
								[{term: 'ALPHA'}, {term: 'BETA'}, {term: 'GAMMA'}],
							],
						},
					]);
				});

				specify('ASTNODE.ASTNodeOpBin[operator=ORDER]', () => {
					assert.deepStrictEqual(makeProductionDefn(`
						Nonterm ::= "TERM1" TERM2;
					`), [
						['TERM1', {term: 'TERM2'}],
					]);
				});

				specify('ASTNODE.ASTNodeOpBin[operator=CONCAT]', () => {
					assert.deepStrictEqual(makeProductionDefn(`
						Nonterm ::= "TERM1" & TERM2;
					`), [
						['TERM1', {term: 'TERM2'}],
						[{term: 'TERM2'}, 'TERM1'],
					]);
				});

				specify('ASTNODE.ASTNodeOpBin[operator=ALTERN]', () => {
					assert.deepStrictEqual(makeProductionDefn(`
						Nonterm ::= "TERM1" | TERM2;
					`), [
						['TERM1'],
						[{term: 'TERM2'}],
					]);
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
							name: 'NonTerm$',
							family: true,
							defn: [
								[{term: 'TERM'}],
								[{term: 'TERM'}],
							],
						},
						{
							name: 'NonTerm',
							family: 'NonTerm$',
							defn: [
								[{term: 'TERM'}],
							],
						},
						{
							name: 'NonTerm_Param',
							family: 'NonTerm$',
							defn: [
								[{term: 'TERM'}],
							],
						},
					]);
				});

				it('memoizes same list productions for different params.', () => {
					const prod: ASTNODE.ASTNodeProduction = Decorator.decorate(new ParserEBNF(`
						NonTerm<Param> ::= TERM+;
					`).parse()).children[0];
					assert.deepStrictEqual(prod.transform(), [
						{
							name: 'NonTerm__0__List',
							defn: [
								[                            {term: 'TERM'}],
								[{prod: 'NonTerm__0__List'}, {term: 'TERM'}],
							],
						},
						{
							name: 'NonTerm$',
							family: true,
							defn: [
								[{prod: 'NonTerm__0__List'}],
								[{prod: 'NonTerm__0__List'}],
							],
						},
						{
							name: 'NonTerm',
							family: 'NonTerm$',
							defn: [
								[{prod: 'NonTerm__0__List'}],
							],
						},
						{
							name: 'NonTerm_Param',
							family: 'NonTerm$',
							defn: [
								[{prod: 'NonTerm__0__List'}],
							],
						},
					]);
				});

				it('generates different parameterized list productions for different params.', () => {
					const prod: ASTNODE.ASTNodeProduction = Decorator.decorate(new ParserEBNF(`
						NonTerm<Param> ::= Ref<?Param>+;
					`).parse()).children[0];
					assert.deepStrictEqual(prod.transform(), [
						{
							name: 'NonTerm__0__List',
							defn: [
								[                            {prod: 'Ref'}],
								[{prod: 'NonTerm__0__List'}, {prod: 'Ref'}],
							],
						},
						{
							name: 'NonTerm_Param__0__List',
							defn: [
								[                                  {prod: 'Ref_Param'}],
								[{prod: 'NonTerm_Param__0__List'}, {prod: 'Ref_Param'}],
							],
						},
						{
							name: 'NonTerm$',
							family: true,
							defn: [
								[{prod: 'NonTerm__0__List'}],
								[{prod: 'NonTerm_Param__0__List'}],
							],
						},
						{
							name: 'NonTerm',
							family: 'NonTerm$',
							defn: [
								[{prod: 'NonTerm__0__List'}],
							],
						},
						{
							name: 'NonTerm_Param',
							family: 'NonTerm$',
							defn: [
								[{prod: 'NonTerm_Param__0__List'}],
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

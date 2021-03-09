import * as assert from 'assert';

import type {
	EBNFObject,
} from '../src/types.d';
import {ParseNode} from '../src/parser/ParseNode';
import {Production} from '../src/grammar/Production';
import {Grammar} from '../src/grammar/Grammar';
import {generate} from '../src/main';
import {
	ParserEBNF,
	Decorator,
} from '../src/ebnf/';



describe('generate', () => {
	it('generates a string consolidating ParseNodes, Productions, Grammar, and Parser.', () => {
		const ebnf: string = `
			Unit ::= NUMBER | "(" OPERATOR Unit Unit ")";
			Goal ::= #x02 Unit? #x03;
		`;
		const jsons: EBNFObject[] = Decorator.decorate(new ParserEBNF(ebnf).parse()).transform();
		assert.strictEqual(generate(ebnf, 'Sample'), (
	`
		import {
			NonemptyArray,
			Token,
			ParseNode,
			Parser,
			Production,
			Grammar,
			GrammarSymbol,
		} from '@chharvey/parser';
		import {LexerSample} from './Lexer';
		import * as TERMINAL from './Terminal';
		${ jsons.map((prod) => Production.fromJSON(prod)).join('') }
		${ jsons.map((prod) => ParseNode .fromJSON(prod)).join('') }
		${ Grammar.fromJSON(jsons, 'Sample') }
		export class ParserSample extends Parser {
			/**
			 * Construct a new ParserSample object.
			 * @param source the source text to parse
			 */
			constructor (source: string) {
				super(new LexerSample(source), grammar_Sample, new Map<Production, typeof ParseNode>([
					[ProductionUnit.instance, ParseNodeUnit],
					[ProductionGoal.instance, ParseNodeGoal],
				]));
			}
			// @ts-expect-error
			declare parse(): ParseNodeGoal;
		}
	`
		));
	});
});

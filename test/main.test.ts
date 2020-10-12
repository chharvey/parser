import * as assert from 'assert';

import type {
	EBNFObject,
} from '../src/types.d';
import {ParseNode} from '../src/parser/ParseNode';
import {Production} from '../src/grammar/Production';
import {generate} from '../src/main';
import {
	PARSER,
	ParserEBNF,
	Decorator,
} from '../src/ebnf/';



describe('generate', () => {
	it('generates a string consolidating ParseNodes, Productions, and Parser.', () => {
		const ebnf: string = `
			Unit ::= NUMBER | "(" OPERATOR Unit Unit ")";
			Goal ::= #x02 Unit? #x03;
		`;
		const jsons: EBNFObject[] = Decorator.decorate(new ParserEBNF(ebnf).parse() as PARSER.ParseNodeGoal).transform();
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
		export class ParserSample extends Parser {
			constructor (source: string) {
				super(source, LexerSample, new Grammar([
					ProductionUnit.instance,ProductionGoal.instance,
				], ProductionGoal.instance), new Map<Production, typeof ParseNode>([
					[ProductionUnit.instance, ParseNodeUnit],[ProductionGoal.instance, ParseNodeGoal],
				]));
			}
		}
	`
		));
	});
});

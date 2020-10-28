import type {
	EBNFObject,
} from './types';
import {ParseNode} from './parser/ParseNode';
import {Production} from './grammar/Production';
import {
	ParserEBNF,
	Decorator,
} from './ebnf/';


export function generate(ebnf: string, langname: string = 'Lang'): string {
	const jsons: EBNFObject[] = Decorator.decorate(new ParserEBNF(ebnf).parse()).transform()
	return `
		import {
			NonemptyArray,
			Token,
			ParseNode,
			Parser,
			Production,
			Grammar,
			GrammarSymbol,
		} from '@chharvey/parser';
		import {Lexer${ langname }} from './Lexer';
		import * as TERMINAL from './Terminal';
		${ jsons.map((j) => Production.fromJSON(j)).join('') }
		${ jsons.map((j) => ParseNode .fromJSON(j)).join('') }
		export class Parser${ langname } extends Parser {
			/**
			 * Construct a new Parser${ langname } object.
			 * @param source the source text to parse
			 */
			constructor (source: string) {
				super(new Lexer${ langname }(source), new Grammar([
					${ jsons.map((json) => `${ Production.classnameOf(json) }.instance`) },
				], ProductionGoal.instance), new Map<Production, typeof ParseNode>([
					${ jsons.map((json) => `[${ Production.classnameOf(json) }.instance, ${ ParseNode.classnameOf(json) }]`) },
				]));
			}
			// @ts-expect-error
			declare parse(): ParseNodeGoal;
		}
	`;
}

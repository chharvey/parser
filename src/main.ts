import type {
	EBNFObject,
} from './types';
import {ParseNode} from './parser/ParseNode';
import {Production} from './grammar/Production';
import {Grammar} from './grammar/Grammar';
import {
	ParserEBNF,
	Decorator,
} from './ebnf/';


export function generate(ebnf: string, langname: string = 'Lang'): string {
	const jsons: EBNFObject[] = Decorator.decorate(new ParserEBNF(ebnf).parse()).transform()
	const nonabstract: EBNFObject[] = jsons.filter((j) => j.family !== true);
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
		${ nonabstract.map((j) => Production.fromJSON(j)).join('') }
		${ jsons.map((j) => ParseNode .fromJSON(j)).join('') }
		${ Grammar.fromJSON(nonabstract, langname) }
		export class Parser${ langname } extends Parser {
			/**
			 * Construct a new Parser${ langname } object.
			 * @param source the source text to parse
			 */
			constructor (source: string) {
				super(new Lexer${ langname }(source), grammar_${ langname }, new Map<Production, typeof ParseNode>([
					${ nonabstract.map((json) => `[${ Production.classnameOf(json) }.instance, ${ ParseNode.classnameOf(json) }]`).join(',\n\t\t\t\t\t') },
				]));
			}
			// @ts-expect-error
			declare parse(): ParseNodeGoal;
		}
	`;
}

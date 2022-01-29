import * as xjs from 'extrajs';
import type {
	EBNFObject,
} from './types';
import {ParseNode} from './parser/ParseNode';
import {Parser} from './parser/Parser';
import {Production} from './grammar/Production';
import {Grammar} from './grammar/Grammar';
import {DECORATOR} from './validator/DecoratorEbnf';
import {PARSER} from './ebnf/Parser.auto';


export function generate(ebnf: string): string {
	const jsons: EBNFObject[] = DECORATOR.decorate(PARSER.parse(ebnf)).transform()
	const nonabstract: EBNFObject[] = jsons.filter((j) => j.family !== true);
	return xjs.String.dedent`
		import {
			NonemptyArray,
			Token,
			ParseNode,
			Parser,
			Production,
			Grammar,
			GrammarSymbol,
		} from '@chharvey/parser';
		import {LEXER} from './Lexer';
		import * as TERMINAL from './Terminal';
		${ nonabstract.map((j) => Production.fromJSON(j)).join('') }
		${ jsons      .map((j) => ParseNode .fromJSON(j)).join('') }
		${ Grammar.fromJSON(nonabstract) }
		${ Parser .fromJSON(nonabstract) }
	`;
}

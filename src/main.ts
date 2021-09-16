import * as xjs from 'extrajs';

import type {
	EBNFObject,
} from './types';
import {ParseNode} from './parser/ParseNode';
import {Parser} from './parser/Parser';
import {Production} from './grammar/Production';
import {Grammar} from './grammar/Grammar';
import {
	PARSER as PARSER_EBNF,
	Decorator,
} from './ebnf/';


export function generate(ebnf: string, langname: string = 'Lang'): string {
	langname;
	const jsons: EBNFObject[] = Decorator.decorate(PARSER_EBNF.parse(ebnf)).transform()
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

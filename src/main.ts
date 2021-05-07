import type {
	EBNFObject,
} from './types';
import * as utils from './utils'
import {ParseNode} from './parser/ParseNode';
import {Parser} from './parser/Parser';
import {Production} from './grammar/Production';
import {Grammar} from './grammar/Grammar';
import {
	ParserEBNF,
	Decorator,
} from './ebnf/';


export function generate(ebnf: string, langname: string = 'Lang'): string {
	const jsons: EBNFObject[] = Decorator.decorate(new ParserEBNF().parse(ebnf)).transform()
	const nonabstract: EBNFObject[] = jsons.filter((j) => j.family !== true);
	return utils.dedent`
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
		${ Grammar.fromJSON(nonabstract, langname) }
		${ Parser .fromJSON(nonabstract, langname) }
	`;
}

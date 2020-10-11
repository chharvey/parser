import type {
	EBNFObject,
} from './types';
import {ParseNode} from './parser/ParseNode';
import {Production} from './grammar/Production';


export function generate(jsons: EBNFObject[], langname: string = 'Lang'): string {
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
			constructor (source: string) {
				super(source, Lexer${ langname }, new Grammar([
					${ jsons.map((json) => `Production${ json.name }.instance`) }
				], ProductionGoal.instance), new Map<Production, typeof ParseNode>([
					${ jsons.map((json) => `[Production${ json.name }.instance, ParseNode${ json.name }]`) }
				]));
			}
		}
	`;
}

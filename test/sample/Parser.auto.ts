

/*----------------------------------------------------------------/
| WARNING: Do not manually update this file!
| It is auto-generated via
| <@chharvey/parser//src/main.ts>.
| If you need to make updates, make them there.
/----------------------------------------------------------------*/


import type {
	NonemptyArray,
} from '../../src/types.d';
import type {Token} from '../../src/lexer/Token';
import {ParseNode} from '../../src/parser/ParseNode';
import {Parser} from '../../src/parser/Parser';
import {Production} from '../../src/grammar/Production';
import {
	Grammar,
	GrammarSymbol,
} from '../../src/grammar/Grammar';
import {LEXER} from './Lexer';
import * as TERMINAL from './Terminal';

class ProductionUnit extends Production {
	static readonly instance: ProductionUnit = new ProductionUnit();
	override get sequences(): NonemptyArray<NonemptyArray<GrammarSymbol>> {
		return [
			[TERMINAL.TerminalNumber.instance],
			['(', TERMINAL.TerminalOperator.instance, ProductionUnit.instance, ProductionUnit.instance, ')'],
		];
	}
}

class ProductionGoal extends Production {
	static readonly instance: ProductionGoal = new ProductionGoal();
	override get sequences(): NonemptyArray<NonemptyArray<GrammarSymbol>> {
		return [
			['\u0002', '\u0003'],
			['\u0002', ProductionUnit.instance, '\u0003'],
		];
	}
}


export class ParseNodeUnit extends ParseNode {
	declare readonly children:
		| readonly [Token]
		| readonly [Token, Token, ParseNodeUnit, ParseNodeUnit, Token]
	;
}

export class ParseNodeGoal extends ParseNode {
	declare readonly children:
		| readonly [Token, Token]
		| readonly [Token, ParseNodeUnit, Token]
	;
}


export const GRAMMAR: Grammar = new Grammar([
	ProductionUnit.instance,
	ProductionGoal.instance,
], ProductionGoal.instance);


export const PARSER: Parser<ParseNodeGoal> = new Parser<ParseNodeGoal>(
	LEXER,
	GRAMMAR,
	new Map<Production, typeof ParseNode>([
		[ProductionUnit.instance, ParseNodeUnit],
		[ProductionGoal.instance, ParseNodeGoal],
	]),
);



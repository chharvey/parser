import type {ParseNode} from '../../src/parser/ParseNode';
import {Parser} from '../../src/parser/Parser';
import type {Production} from '../../src/grammar/Production';
import {
	Grammar,
} from '../../src/grammar/Grammar';
import {MyLexer} from './Lexer';
import * as PARSENODE from './ParseNode';
import * as PRODUCTION from './Production';



export class MyParser extends Parser {
	constructor (source: string) {
		super(source, MyLexer, new Grammar([
			PRODUCTION.ProductionUnit.instance,
			PRODUCTION.ProductionGoal.instance,
		], PRODUCTION.ProductionGoal.instance), new Map<Production, typeof ParseNode>([
			[PRODUCTION.ProductionUnit.instance, PARSENODE.ParseNodeUnit],
			[PRODUCTION.ProductionGoal.instance, PARSENODE.ParseNodeGoal],
		]));
	}
}

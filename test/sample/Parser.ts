import type {ParseNode} from '../../src/parser/ParseNode';
import {Parser} from '../../src/parser/Parser';
import type {Production} from '../../src/grammar/Production';
import {
	Grammar,
} from '../../src/grammar/Grammar';
import {LexerSample} from './Lexer';
import * as PARSENODE from './ParseNode';
import * as PRODUCTION from './Production';



export class ParserSample extends Parser {
	constructor (source: string) {
		super(source, LexerSample, new Grammar([
			PRODUCTION.ProductionUnit.instance,
			PRODUCTION.ProductionGoal.instance,
		], PRODUCTION.ProductionGoal.instance), new Map<Production, typeof ParseNode>([
			[PRODUCTION.ProductionUnit.instance, PARSENODE.ParseNodeUnit],
			[PRODUCTION.ProductionGoal.instance, PARSENODE.ParseNodeGoal],
		]));
	}
}

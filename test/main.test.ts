import * as assert from 'assert';

import {ParseNode} from '../src/parser/ParseNode';
import {Production} from '../src/grammar/Production';
import {generate} from '../src/main';
import {
	grammar,
} from './samples';



describe('generate', () => {
	it('generates a string consolidating ParseNodes, Productions, and Parser.', () => {
		assert.strictEqual(generate(grammar, 'Sample'), (
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
		${ grammar.map((prod) => Production.fromJSON(prod)).join('') }
		${ grammar.map((prod) => ParseNode .fromJSON(prod)).join('') }
		export class ParserSample extends Parser {
			constructor (source: string) {
				super(source, LexerSample, new Grammar([
					ProductionUnit.instance,ProductionGoal.instance
				], ProductionGoal.instance), new Map<Production, typeof ParseNode>([
					[ProductionUnit.instance, ParseNodeUnit],[ProductionGoal.instance, ParseNodeGoal]
				]));
			}
		}
	`
		));
	});
});

import * as assert from 'assert';
import * as xjs from 'extrajs';
import type {
	EBNFObject,
} from '../src/types.d';
import {ParseNode} from '../src/parser/ParseNode';
import {Parser} from '../src/parser/Parser';
import {Production} from '../src/grammar/Production';
import {Grammar} from '../src/grammar/Grammar';
import {DECORATOR} from '../src/validator/DecoratorEbnf';
import {PARSER} from '../src/ebnf/Parser.auto';
import {generate} from '../src/main';



describe('generate', () => {
	it('generates a string consolidating ParseNodes, Productions, Grammar, and Parser.', () => {
		const ebnf: string = `
			Unit ::= NUMBER | "(" OPERATOR Unit Unit ")";
			Goal ::= #x02 Unit? #x03;
		`;
		const jsons: EBNFObject[] = DECORATOR.decorate(PARSER.parse(ebnf)).transform();
		assert.strictEqual(generate(ebnf), xjs.String.dedent`
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
			${ jsons.map((prod) => Production.fromJSON(prod)).join('') }
			${ jsons.map((prod) => ParseNode .fromJSON(prod)).join('') }
			${ Grammar.fromJSON(jsons) }
			${ Parser .fromJSON(jsons) }
		`);
	});
});

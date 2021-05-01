import * as assert from 'assert';

import * as utils from '../../src/utils';
import {Grammar} from '../../src/grammar/Grammar';
import {
	ParserEBNF,
	grammar_EBNF,
	Decorator,
} from '../../src/ebnf/';



describe('Grammar', () => {
	describe('.fromJSON', () => {
		it('returns a string representing a new instance of Grammar.', () => {
			assert.strictEqual(Grammar.fromJSON(Decorator.decorate(new ParserEBNF(`
				Unit ::= NUMBER | "(" OPERATOR Unit Unit ")";
				Goal ::= #x02 Unit? #x03;
			`).parse()).transform(), 'Sample'), utils.dedent`
				export const grammar_Sample: Grammar = new Grammar([
					ProductionUnit.instance,
					ProductionGoal.instance,
				], ProductionGoal.instance);
			`);
		});
	});


	describe.skip('#random', () => {
		it('generates a random language instance.', () => {
			for (const _ of Array(10)) {
				const text = grammar_EBNF.random().slice(1, -1).join('');
				console.log(text);
				assert.doesNotThrow(() => new ParserEBNF(text).parse());
			}
		});
	});
});

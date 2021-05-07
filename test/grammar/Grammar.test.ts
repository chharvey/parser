import * as assert from 'assert';

import * as utils from '../../src/utils';
import {Grammar} from '../../src/grammar/Grammar';
import {
	ParserEBNF,
	Decorator,
} from '../../src/ebnf/';



describe('Grammar', () => {
	describe('.fromJSON', () => {
		it('returns a string representing a new instance of Grammar.', () => {
			assert.strictEqual(Grammar.fromJSON(Decorator.decorate(new ParserEBNF().parse(`
				Unit ::= NUMBER | "(" OPERATOR Unit Unit ")";
				Goal ::= #x02 Unit? #x03;
			`)).transform(), 'Sample'), utils.dedent`
				export const grammar_Sample: Grammar = new Grammar([
					ProductionUnit.instance,
					ProductionGoal.instance,
				], ProductionGoal.instance);
			`);
		});
	});
});

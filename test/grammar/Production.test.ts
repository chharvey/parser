import * as assert from 'assert'

import {Rule} from '../../src/grammar/Rule'
import {Production} from '../../src/grammar/Production'
import {
	ProductionUnit,
} from '../samples'



describe('Production', () => {
	describe('.fromJSON', () => {
		it('returns a string representing new subclasses of Production.', () => {
			assert.strictEqual(Production.fromJSON(JSON.parse(`
				[
					{
						"name": "Unit",
						"defn": [
							[{"term": "NUMBER"}],
							["'('", {"term": "OPERATOR"}, {"prod": "Unit"}, {"prod": "Unit"}, "')'"]
						]
					}
				]
			`)), (
		`
			import {
				NonemptyArray,
				GrammarSymbol,
				Production,
			} from '@chharvey/parser';
			import * as TERMINAL from './Terminal.class';
\t\t\t
				export class ProductionUnit extends Production {
					static readonly instance: ProductionUnit = new ProductionUnit();
					/** @implements Production */
					get sequences(): NonemptyArray<NonemptyArray<GrammarSymbol>> {
						return [
							${ `
								[TERMINAL.TerminalNumber.instance],
								['(', TERMINAL.TerminalOperator.instance, ProductionUnit.instance, ProductionUnit.instance, ')'],
							`.replace(/\s+/g, '') }
						];
					}
				}
\t\t\t
		`
			))
		})
	})

	describe('#displayName', () => {
		it('returns the display name.', () => {
			assert.strictEqual(ProductionUnit.instance.displayName, 'Unit');
		});
	});

	describe('#toRules', () => {
		it('decomposes the production into a list of rules.', () => {
			assert.deepStrictEqual(ProductionUnit.instance.toRules(), [
				new Rule(ProductionUnit.instance, 0),
				new Rule(ProductionUnit.instance, 1),
			]);
		});
	});
});

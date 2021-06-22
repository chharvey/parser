import * as assert from 'assert';
import * as xjs from 'extrajs';

import type {
	EBNFObject,
} from '../../src/types.d';
import {Production} from '../../src/grammar/Production';
import {Rule} from '../../src/grammar/Rule';
import {PARSER as PARSERSAMPLE} from '../sample/';



describe('Production', () => {
	describe('.fromJSON', () => {
		it('returns a string representing new subclasses of Production.', () => {
			assert.deepStrictEqual(([
				{
					name: 'Unit',
					defn: [
						[{term: 'NUMBER'}],
						['(', {term: 'OPERATOR'}, {prod: 'Unit'}, {prod: 'Unit'}, ')'],
					],
				},
				{
					name: 'Goal',
					defn: [
						['\\u0002',                 '\\u0003'],
						['\\u0002', {prod: 'Unit'}, '\\u0003'],
					],
				},
			] as EBNFObject[]).map((prod) => Production.fromJSON(prod)), [xjs.String.dedent`
				export class ProductionUnit extends Production {
					static readonly instance: ProductionUnit = new ProductionUnit();
					/** @implements Production */
					override get sequences(): NonemptyArray<NonemptyArray<GrammarSymbol>> {
						return [
							[TERMINAL.TerminalNumber.instance],
							['(', TERMINAL.TerminalOperator.instance, ProductionUnit.instance, ProductionUnit.instance, ')'],
						];
					}
				}
			`, xjs.String.dedent`
				export class ProductionGoal extends Production {
					static readonly instance: ProductionGoal = new ProductionGoal();
					/** @implements Production */
					override get sequences(): NonemptyArray<NonemptyArray<GrammarSymbol>> {
						return [
							['\\u0002', '\\u0003'],
							['\\u0002', ProductionUnit.instance, '\\u0003'],
						];
					}
				}
			`]);
		});
	});

	describe('#displayName', () => {
		it('returns the display name.', () => {
			assert.strictEqual(PARSERSAMPLE.ProductionUnit.instance.displayName, 'Unit');
		});
	});

	describe('#toRules', () => {
		it('decomposes the production into a list of rules.', () => {
			assert.deepStrictEqual(PARSERSAMPLE.ProductionUnit.instance.toRules(), [
				new Rule(PARSERSAMPLE.ProductionUnit.instance, 0),
				new Rule(PARSERSAMPLE.ProductionUnit.instance, 1),
			]);
		});
	});
});

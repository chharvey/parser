import type {
	NonemptyArray,
} from '../../src/types.d';
import {Filebound} from '../../src/utils';
import {Production} from '../../src/grammar/Production';
import type {
	GrammarSymbol,
} from '../../src/grammar/Grammar';
import * as TERMINAL from './Terminal';



export class ProductionUnit extends Production {
	static readonly instance: ProductionUnit = new ProductionUnit();
	get sequences(): NonemptyArray<NonemptyArray<GrammarSymbol>> {
		return [
			[TERMINAL.TerminalNumber.instance],
			['(', TERMINAL.TerminalOperator.instance, ProductionUnit.instance, ProductionUnit.instance, ')'],
		];
	}
}



export class ProductionGoal extends Production {
	static readonly instance: ProductionGoal = new ProductionGoal();
	get sequences(): NonemptyArray<NonemptyArray<GrammarSymbol>> {
		return [
			[Filebound.SOT,                          Filebound.EOT],
			[Filebound.SOT, ProductionUnit.instance, Filebound.EOT],
		];
	}
}

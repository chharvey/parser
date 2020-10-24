import * as xjs from 'extrajs';

import type {
	NonemptyArray,
	EBNFObject,
} from '../types.d';
import * as utils from '../utils';
import {Rule} from './Rule';
import type {
	GrammarSymbol,
} from './Grammar';



/**
 * A Production is an item in a formal context-free grammar.
 * It consists of a nonterminal on the left-hand side, which serves as the identifier of the production,
 * and on the right-hand side one ore more choices, or sequences of terminals and/or nonterminals,
 * which can be reduced to the left-hand side nonterminal in a parsing action.
 */
export abstract class Production {
	/**
	 * Takes a JSON object representing a syntactic production
	 * and returns a string in TypeScript language representing subclasses of {@link Production}.
	 * @param   json a JSON object representing a production
	 * @returns      a string to print to a TypeScript file
	 */
	static fromJSON(json: EBNFObject): string {
		return `
			export class Production${ json.name } extends Production {
				static readonly instance: Production${ json.name } = new Production${ json.name }();
				/** @implements Production */
				get sequences(): NonemptyArray<NonemptyArray<GrammarSymbol>> {
					return [
						${ json.defn.map((seq) => `[${ seq.map((it) =>
							(typeof it === 'string') ? `'${ it }'` :
							('term' in it) ? `TERMINAL.Terminal${ utils.macroToTitle(it.term) }.instance` :
							`Production${ it.prod }.instance`
						) }]`) },
					];
				}
			}
		`;
	}


	protected constructor () {
	}

	/** @final */ get displayName(): string {
		return this.constructor.name.slice('Production'.length);
	}

	/**
	 * A set of sequences of parse symbols (terminals and/or nonterminals) in this production.
	 */
	abstract get sequences(): NonemptyArray<NonemptyArray<GrammarSymbol>>;

	/**
	 * Is this production “equal to” the argument?
	 *
	 * Two productions are “equal” if they are the same object, or all of the following are true:
	 * - The corresponding rules of both productions are “equal” (by {@link Rule#equals}).
	 *
	 * @param   prod the production to compare
	 * @returns      is this production “equal to” the argument?
	 * @final
	 */
	equals(prod: Production) {
		return this === prod ||
			this.displayName === prod.displayName &&
			xjs.Array.is<Rule>(this.toRules(), prod.toRules(), (r1, r2) => r1.equals(r2));
	}


	/**
	 * Generate grammar rules from this Production.
	 * @returns this Production split into several rules
	 * @final
	 */
	toRules(): Rule[] {
		return this.sequences.map((_, i) => new Rule(this, i));
	}
}

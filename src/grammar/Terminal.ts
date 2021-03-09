import * as utils from '../utils';
import type {Token} from '../lexer/Token';



/**
 * A Terminal is a symbol in a production (a formal context-free grammar) that cannot be reduced any further.
 * It serves as a distinction betwen different types of actual tokens.
 */
export abstract class Terminal {
	protected constructor () {
	}

	/** @final */ get displayName(): string {
		return utils.titleToMacro(this.constructor.name.slice('Terminal'.length));
	}

	/**
	 * Does the given Token satisfy this Terminal?
	 * @param   candidate a Token to test
	 * @returns           does the given Token satisfy this Terminal?
	 */
	abstract match(candidate: Token): boolean;

	/**
	 * Generate a random instance of this Terminal.
	 * @returns a well-formed string satisfying this Terminal
	 * @note This is an instance method even though it may be implemented as if it were static (not referencing `this`).
	 * This is because this method will be instance when the lexical grammar is automated.
	 */
	abstract random(): string;
}

import type {Char} from '../scanner/Char';
import type {Token} from '../lexer/Token';
import {ErrorCode} from './ErrorCode';



/**
 * A LexError is thrown when a span of source code fails to
 * produce a valid token per the rules of the defined lexical grammar.
 */
export class LexError extends ErrorCode {
	/** The name of this class of errors. */
	static override readonly NAME = 'LexError';
	/** The number series of this class of errors. */
	static readonly CODE: number = 1100;


	/**
	 * Construct a new LexError object.
	 * @param message a message to the user
	 * @param code    the error number
	 * @param line    the line index in source code
	 * @param col     the column index in source code
	 */
	constructor (message: string, code: number = 0, line?: number, col?: number) {
		super({
			message,
			name:       LexError.NAME,
			code:       LexError.CODE + code,
			line_index: line,
			col_index:  col,
		});
	}
}



/**
 * A LexError01 is thrown when the lexer reaches an unrecognized character.
 * @final
 */
export class LexError01 extends LexError {
	/** The number series of this class of errors. */
	static override readonly CODE = 1;


	/**
	 * Construct a new LexError01 object.
	 * @param char the unrecognized character
	 */
	constructor (char: Char) {
		super(`Unrecognized character: \`${ char.source }\` at line ${ char.line_index + 1 } col ${ char.col_index + 1 }.`, LexError01.CODE, char.line_index, char.col_index);
	}
}



/**
 * A LexError02 is thrown when the lexer reaches the end of the file before the end of a token.
 * @final
 */
export class LexError02 extends LexError {
	/** The number series of this class of errors. */
	static override readonly CODE = 2;


	/**
	 * Construct a new LexError02 object.
	 * @param token the token that did not finish
	 */
	constructor (token: Token) {
		super(`Found end of file before end of ${ token.tagname }: \`${ token.source }\`.`, LexError02.CODE, token.line_index, token.col_index);
	}
}

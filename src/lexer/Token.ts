import * as utils from '../utils';
import {Filebound} from '../utils';
import type {Serializable} from '../Serializable';
import {Char} from '../scanner/Char';
import type {Lexer} from './Lexer';
import {
	LexError02,
} from '../error/LexError';



/**
 * A Token object is the kind of thing that the Lexer returns.
 * It holds:
 * - the text of the token (self.cargo)
 * - the line number and column index where the token starts
 *
 * @see http://parsingintro.sourceforge.net/#contents_item_6.4
 */
export class Token implements Serializable {
	/** @implements Serializable */
	readonly source_index: number;
	/** @implements Serializable */
	readonly line_index: number;
	/** @implements Serializable */
	readonly col_index: number;

	/** All the characters in this Token. */
	private _cargo: string;

	/**
	 * Construct a new Token object.
	 * @param tagname    The name of the type of this Token.
	 * @param lexer      The lexer used to construct this Token.
	 * @param start_char the starting character of this Token
	 * @param more_chars additional characters to add upon construction
	 * @throws           {LexError02} if the end of the file is reached before the end of the token
	 */
	constructor (
		/** @implements Serializable */
		readonly tagname: string,
		protected readonly lexer: Lexer,
		start_char: Char,
		...more_chars: Char[]
	) {
		this._cargo       = [start_char, ...more_chars].map((char) => char.source).join('');
		this.source_index = start_char.source_index;
		this.line_index   = start_char.line_index;
		this.col_index    = start_char.col_index;
	}

	/**
	 * Get the sum of this Token’s cargo.
	 * @implements Serializable
	 * @returns all the source characters in this Token
	 * @final
	 */
	get source(): string {
		return this._cargo;
	}

	/** @implements Serializable */
	serialize(): string {
		return `<${ this.tagname } ${ utils.stringifyAttributes(new Map<string, string>([
			['line', `${ this.line_index + 1 }`],
			['col',  `${ this.col_index  + 1 }`],
		])) }>${ utils.sanitizeContent(this.source) }</${ this.tagname }>`;
	}

	/**
	 * Add to this Token’s cargo.
	 * @param lexer the lexer whose characters to take from
	 * @param n     the number of characters to append
	 * @final
	 */
	protected advance(n: bigint = 1n): void {
		this._cargo += this.lexer.advance(n).map((char) => char.source).join('');
	}
}



/** @final */ export class TokenFilebound extends Token {
	static readonly CHARS: readonly Filebound[] = [Filebound.SOT, Filebound.EOT];
	// declare readonly source: Filebound; // NB: https://github.com/microsoft/TypeScript/issues/40220


	constructor (lexer: Lexer) {
		super('FILEBOUND', lexer, ...lexer.advance());
	}
}



/** @final */ export class TokenWhitespace extends Token {
	static readonly CHARS: readonly string[] = [' ', '\t', '\n'];


	constructor (lexer: Lexer) {
		super('WHITESPACE', lexer, ...lexer.advance());
		while (!this.lexer.isDone && Char.inc(TokenWhitespace.CHARS, this.lexer.c0)) {
			this.advance();
		};
	}
}



export abstract class TokenComment extends Token {
	constructor (lexer: Lexer, start_delim: string, end_delim: string) {
		super('COMMENT', lexer, ...lexer.advance(BigInt(start_delim.length)));
		while (!this.lexer.isDone && !this.stopAdvancing()) {
			if (Char.eq(Filebound.EOT, this.lexer.c0)) {
				throw new LexError02(this);
			};
			this.advance();
		};
		// add end delim to token
		this.advance(BigInt(end_delim.length));
	}

	/**
	 * Helper method used in the constructor.
	 * @returns When should the lexer stop advancing?
	 */
	protected abstract stopAdvancing(): boolean;
}

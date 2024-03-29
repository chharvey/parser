import {
	Filebound,
	stringifyAttributes,
	sanitizeContent,
} from '../utils';
import type {NonemptyArray} from '../types';
import type {Serializable} from '../Serializable';
import type {Char} from '../scanner/Char';



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
	 * @param chars      characters to add upon construction
	 */
	constructor (
		/** @implements Serializable */
		readonly tagname: string,
		...chars: NonemptyArray<Char>
	) {
		this._cargo       = chars.map((char) => char.source).join('');
		this.source_index = chars[0].source_index;
		this.line_index   = chars[0].line_index;
		this.col_index    = chars[0].col_index;
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
		return `<${ this.tagname } ${ stringifyAttributes(new Map<string, string>([
			['line', (this.line_index + 1).toString()],
			['col',  (this.col_index  + 1).toString()],
		])) }>${ sanitizeContent(this.source) }</${ this.tagname }>`;
	}
}



/** @final */
export class TokenFilebound extends Token {
	static readonly CHARS: readonly Filebound[] = [Filebound.SOT, Filebound.EOT];
	// declare readonly source: Filebound; // NB: https://github.com/microsoft/TypeScript/issues/40220


	constructor (...chars: NonemptyArray<Char>) {
		super('FILEBOUND', ...chars);
	}
}



/** @final */
export class TokenWhitespace extends Token {
	static readonly CHARS: readonly string[] = [' ', '\t', '\n'];


	constructor (...chars: NonemptyArray<Char>) {
		super('WHITESPACE', ...chars);
	}
}



export class TokenComment extends Token {
	constructor (...chars: NonemptyArray<Char>) {
		super('COMMENT', ...chars);
	}
}

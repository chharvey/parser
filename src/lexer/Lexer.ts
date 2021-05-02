import {Char} from '../scanner/Char';
import {
	Token,
	TokenFilebound,
	TokenWhitespace,
} from './Token';
import {Scanner} from '../scanner/Scanner';
import {
	LexError01,
} from '../error/LexError';



/**
 * A Lexer (aka: Tokenizer, Lexical Analyzer).
 * @see http://parsingintro.sourceforge.net/#contents_item_6.5
 */
export class Lexer {
	/** A character generator produced by a Scanner. */
	private readonly char_generator: Generator<Char>;
	/** The result of the scanner iterator. */
	private iterator_result_char: IteratorResult<Char, void>;
	/** The current character. */
	private _c0: Char;
	/** The lookahead(1) character. */
	private _c1: Char | null;
	/** The lookahead(2) character. */
	private _c2: Char | null;
	/** The lookahead(3) character. */
	private _c3: Char | null;

	/**
	 * Construct a new Lexer object.
	 * @param source the source text
	 */
	constructor (source: string) {
		this.char_generator = Scanner.generate(source);
		this.iterator_result_char = this.char_generator.next();
		this._c0 = this.iterator_result_char.value as Char;
		this._c1 = this._c0.lookahead();
		this._c2 = this._c0.lookahead(2n);
		this._c3 = this._c0.lookahead(3n);
	}

	/** @final */ get c0(): Char        { return this._c0; }
	/** @final */ get c1(): Char | null { return this._c1; }
	/** @final */ get c2(): Char | null { return this._c2; }
	/** @final */ get c3(): Char | null { return this._c3; }
	/** @final */ get isDone(): boolean { return !!this.iterator_result_char.done; }

	/**
	 * Advance this Lexer, scanning the next character and reassigning variables.
	 * @param   n the number of times to advance
	 * @returns   all the characters scanned since the last advance
	 * @throws    {RangeError} if the argument is not a positive integer
	 * @final
	 */
	advance(n?: 1n): [Char];
	advance(n: bigint): [Char, ...Char[]];
	advance(n: bigint = 1n): [Char, ...Char[]] {
		if (n <= 0n) { throw new RangeError('Argument must be a positive integer.'); };
		if (n === 1n) {
			const returned: Char = this._c0;
			this.iterator_result_char = this.char_generator.next();
			if (!this.iterator_result_char.done) {
				this._c0 = this.iterator_result_char.value;
				this._c1 = this._c0.lookahead();
				this._c2 = this._c0.lookahead(2n);
				this._c3 = this._c0.lookahead(3n);
			};
			return [returned];
		} else {
			return [
				...this.advance(),
				...this.advance(n - 1n),
			] as [Char, ...Char[]];
		};
	}

	/**
	 * Construct and return the next token in the source text.
	 * @returns the next token
	 * @throws  {LexError01} if an unrecognized character was reached
	 * @final
	 */
	* generate(): Generator<Token> {
		while (!this.isDone) {
			if (Char.inc(TokenFilebound.CHARS, this.c0)) {
				yield new TokenFilebound(this);
			} else if (Char.inc(TokenWhitespace.CHARS, this.c0)) {
				yield new TokenWhitespace(this);
			} else {
				yield this.generate_do() || (() => { throw new LexError01(this.c0); })();
			};
		};
	}
	protected generate_do(): Token | null {
		return null;
	}
}

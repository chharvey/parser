import {Filebound} from '../utils';
import {Char} from '../scanner/Char';
import {
	LexError02,
} from '../error/LexError';
import type {
	Token,
} from '../lexer/Token';
import {Lexer} from '../lexer/Lexer';
import * as TOKEN from './Token'
import type {NonemptyArray} from '../types';


export class LexerEBNF extends Lexer {
	protected generate_do(): Token | null {
		if (Char.inc(TOKEN.TokenPunctuator.PUNCTUATORS_4, this.c0, this.c1, this.c2, this.c3)) {
			return new TOKEN.TokenPunctuator(this, ...this.advance(4n));

		} else if (Char.inc(TOKEN.TokenPunctuator.PUNCTUATORS_3, this.c0, this.c1, this.c2)) {
			return new TOKEN.TokenPunctuator(this, ...this.advance(3n));

		} else if (Char.inc(TOKEN.TokenPunctuator.PUNCTUATORS_2, this.c0, this.c1)) {
			return new TOKEN.TokenPunctuator(this, ...this.advance(2n));

		} else if (Char.inc(TOKEN.TokenPunctuator.PUNCTUATORS_1, this.c0)) {
			if (Char.eq(TOKEN.TokenCharCode.START, this.c0, this.c1)) {
				/* we found a char code */
				const buffer: NonemptyArray<Char> = [...this.advance(2n)];
				while (!this.isDone && TOKEN.TokenCharCode.REST.test(this.c0.source)) {
					buffer.push(...this.advance());
				};
				return new TOKEN.TokenCharCode(this, ...buffer);

			} else {
				/* we found a Kleene hash or another punctuator */
				return new TOKEN.TokenPunctuator(this, ...this.advance());
			};

		} else if (TOKEN.TokenIdentifier.START.test(this.c0.source)) {
			const buffer: NonemptyArray<Char> = [...this.advance()];
			while (!this.isDone && TOKEN.TokenIdentifier.REST.test(this.c0.source)) {
				buffer.push(...this.advance());
			};
			return new TOKEN.TokenIdentifier(this, ...buffer);

		} else if (Char.eq(TOKEN.TokenString.DELIM, this.c0)) {
			const buffer: NonemptyArray<Char> = [...this.advance()];
			while (!this.isDone && !Char.eq(TOKEN.TokenString.DELIM, this.c0)) {
				if (Char.eq(Filebound.EOT, this.c0)) {
					throw new LexError02(new TOKEN.TokenString(this, ...buffer));
				};
				buffer.push(...this.advance());
			}
			// add ending delim to token
			buffer.push(...this.advance());
			return new TOKEN.TokenString(this, ...buffer);

		} else if (Char.eq(TOKEN.TokenCharClass.DELIM_START, this.c0)) {
			const buffer: NonemptyArray<Char> = [...this.advance()];
			while (!this.isDone && !Char.eq(TOKEN.TokenCharClass.DELIM_END, this.c0)) {
				if (Char.eq(Filebound.EOT, this.c0)) {
					throw new LexError02(new TOKEN.TokenCharClass(this, ...buffer));
				};
				buffer.push(...this.advance());
			}
			// add ending delim to token
			buffer.push(...this.advance());
			return new TOKEN.TokenCharClass(this, ...buffer);

		} else if (Char.eq(TOKEN.TokenCommentEBNF.DELIM_START, this.c0, this.c1)) {
			const buffer: NonemptyArray<Char> = [...this.advance(BigInt(TOKEN.TokenCommentEBNF.DELIM_START.length))];
			while (!this.isDone && !Char.eq(TOKEN.TokenCommentEBNF.DELIM_END, this.c0)) {
				if (Char.eq(Filebound.EOT, this.c0)) {
					throw new LexError02(new TOKEN.TokenCommentEBNF(this, ...buffer));
				};
				buffer.push(...this.advance());
			};
			// add end delim to token
			buffer.push(...this.advance(BigInt(TOKEN.TokenCommentEBNF.DELIM_END.length)));
			return new TOKEN.TokenCommentEBNF(this, ...buffer);

		} else {
			return null;
		};
	}
}

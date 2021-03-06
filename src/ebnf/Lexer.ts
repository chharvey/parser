import {Char} from '../scanner/Char';
import type {
	Token,
} from '../lexer/Token';
import {Lexer} from '../lexer/Lexer';
import * as TOKEN from './Token'


export class LexerEBNF extends Lexer {
	protected override generate_do(): Token | null {
		if (Char.inc(TOKEN.TokenPunctuator.PUNCTUATORS_4, this.c0, this.c1, this.c2, this.c3)) {
			return new TOKEN.TokenPunctuator(this, 4n);
		} else if (Char.inc(TOKEN.TokenPunctuator.PUNCTUATORS_3, this.c0, this.c1, this.c2)) {
			return new TOKEN.TokenPunctuator(this, 3n);
		} else if (Char.inc(TOKEN.TokenPunctuator.PUNCTUATORS_2, this.c0, this.c1)) {
			return new TOKEN.TokenPunctuator(this, 2n);
		} else if (Char.inc(TOKEN.TokenPunctuator.PUNCTUATORS_1, this.c0)) {
			if (Char.eq(TOKEN.TokenCharCode.START, this.c0, this.c1)) {
				/* we found a char code */
				return new TOKEN.TokenCharCode(this);
			} else {
				/* we found a Kleene hash or another punctuator */
				return new TOKEN.TokenPunctuator(this);
			};

		} else if (TOKEN.TokenIdentifier.START.test(this.c0.source)) {
			return new TOKEN.TokenIdentifier(this);

		} else if (Char.eq(TOKEN.TokenString.DELIM, this.c0)) {
			return new TOKEN.TokenString(this);

		} else if (Char.eq(TOKEN.TokenCharClass.DELIM_START, this.c0)) {
			return new TOKEN.TokenCharClass(this);

		} else if (Char.eq(TOKEN.TokenCommentEBNF.DELIM_START, this.c0, this.c1)) {
			return new TOKEN.TokenCommentEBNF(this);

		} else {
			return null;
		};
	}
}

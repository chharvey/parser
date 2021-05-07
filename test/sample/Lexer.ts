import {Filebound} from '../../src/utils';
import type {NonemptyArray} from '../../src/types';
import {Char} from '../../src/scanner/Char';
import {
	Token,
} from '../../src/lexer/Token';
import {Lexer} from '../../src/lexer/Lexer';
import * as TOKEN from './Token';
import {
	LexError02,
} from '../../src/error/LexError';



export class LexerSample extends Lexer {
	protected generate_do(): Token | null {
		if (Char.inc(['(', ')', '^', '*', '+'], this.c0)) {
			return new Token('PUNCTUATOR', this, ...this.advance());

		} else if (/[0-9]/.test(this.c0.source)) {
			const buffer: NonemptyArray<Char> = [...this.advance()];
			while (!this.isDone && /[0-9]/.test(this.c0.source)) {
				buffer.push(...this.advance());
			};
			return new TOKEN.TokenNumber(this, ...buffer);

		} else if (Char.eq('[', this.c0)) {
			const buffer: NonemptyArray<Char> = [...this.advance(BigInt('['.length))];
			while (!this.isDone && !Char.eq(']', this.c0)) {
				if (Char.eq(Filebound.EOT, this.c0)) {
					throw new LexError02(new TOKEN.TokenCommentSample(this, ...buffer));
				};
				buffer.push(...this.advance());
			};
			// add end delim to token
			buffer.push(...this.advance(BigInt(']'.length)));
			return new TOKEN.TokenCommentSample(this, ...buffer);

		} else {
			return null;
		};
	}
}

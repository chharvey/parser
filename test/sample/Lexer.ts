import type {NonemptyArray} from '../../src/types';
import {Char} from '../../src/scanner/Char';
import {
	Token,
} from '../../src/lexer/Token';
import {Lexer} from '../../src/lexer/Lexer';
import * as TOKEN from './Token';



class LexerSample extends Lexer {
	protected generate_do(): Token | null {
		if (Char.inc(['(', ')', '^', '*', '+'], this.c0)) {
			return new Token('PUNCTUATOR', ...this.advance());

		} else if (/[0-9]/.test(this.c0.source)) {
			const buffer: NonemptyArray<Char> = [...this.advance()];
			while (!this.isDone && /[0-9]/.test(this.c0.source)) {
				buffer.push(...this.advance());
			};
			return new TOKEN.TokenNumber(...buffer);

		} else if (Char.eq('[', this.c0)) {
			return new TOKEN.TokenCommentSample(...this.lexQuoted('[', ']'));

		} else {
			return null;
		};
	}
}

export const LEXER: LexerSample = new LexerSample();

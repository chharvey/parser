import {Char} from '../../src/scanner/Char';
import {
	Token,
} from '../../src/lexer/Token';
import {Lexer} from '../../src/lexer/Lexer';
import * as TOKEN from './Token';



export class LexerSample extends Lexer {
	protected override generate_do(): Token | null {
		return (Char.inc(['(', ')', '^', '*', '+'], this.c0)) ?
			new Token('PUNCTUATOR', this, ...this.advance())
		: (/[0-9]/.test(this.c0.source)) ?
			new TOKEN.TokenNumber(this)
		: (Char.eq('[', this.c0)) ?
			new TOKEN.TokenCommentSample(this)
		: null;
	}
}

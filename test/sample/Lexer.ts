import {Char} from '../../src/scanner/Char';
import {
	Token,
} from '../../src/lexer/Token';
import {Lexer} from '../../src/lexer/Lexer';
import * as TOKEN from './Token';



export class MyLexer extends Lexer {
	protected generate_do(): Token | null {
		return (Char.inc(['(', ')', '^', '*', '+'], this.c0)) ?
			new Token('PUNCTUATOR', this, ...this.advance())
		: (/[0-9]/.test(this.c0.source)) ?
			new TOKEN.MyTokenNumber(this)
		: (Char.eq('[', this.c0)) ?
			new TOKEN.MyTokenComment(this)
		: null;
	}
}

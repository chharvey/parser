import {Char} from '../src/scanner/Char'
import {
	Token,
	TokenComment,
} from '../src/lexer/Token'
import {Lexer} from '../src/lexer/Lexer'



/*
Sample objects for testing purposes only.

Lexical Grammar:
```
Punctuator :::= "(" | ")" | "^" | "*" | "+";
Number     :::= [0-9]+;
Comment    :::= "[" [^#5d]* "]"; // any character except U+005d RIGHT SQUARE BRACKET
```
*/

export class MyTokenNumber extends Token {
	constructor (lexer: Lexer) {
		super('NUMBER', lexer, ...lexer.advance());
		while (!this.lexer.isDone && /[0-9]/.test(this.lexer.c0.source)) {
			this.advance();
		};
	}
}

export class MyTokenComment extends TokenComment {
	constructor (lexer: Lexer) {
		super(lexer, '[', ']');
	}
	protected stopAdvancing(): boolean {
		return Char.eq(']', this.lexer.c0);
	}
}

export class MyLexer extends Lexer {
	protected generate_do(): Token | null {
		return (Char.inc(['(', ')', '^', '*', '+'], this.c0)) ?
			new Token('PUNCTUATOR', this, ...this.advance())
		: (/[0-9]/.test(this.c0.source)) ?
			new MyTokenNumber(this)
		: (Char.eq('[', this.c0)) ?
			new MyTokenComment(this)
		: null;
	}
}

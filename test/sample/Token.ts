import {Char} from '../../src/scanner/Char';
import {
	Token,
	TokenComment,
} from '../../src/lexer/Token';
import type {Lexer} from '../../src/lexer/Lexer';



export class TokenNumber extends Token {
	constructor (lexer: Lexer) {
		super('NUMBER', lexer, ...lexer.advance());
		while (!this.lexer.isDone && /[0-9]/.test(this.lexer.c0.source)) {
			this.advance();
		};
	}
}



export class TokenCommentSample extends TokenComment {
	constructor (lexer: Lexer) {
		super(lexer, '[', ']');
	}
	protected stopAdvancing(): boolean {
		return Char.eq(']', this.lexer.c0);
	}
}

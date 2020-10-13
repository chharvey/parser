import {Filebound} from '../utils';
import {Char} from '../scanner/Char';
import {
	Token,
	TokenComment,
} from '../lexer/Token';
import type {Lexer} from '../lexer/Lexer';
import {
	LexError02,
} from '../error/LexError';



export class TokenPunctuator extends Token {
	static readonly PUNCTUATORS_4: readonly string[] = `:::=`.split(' ');
	static readonly PUNCTUATORS_3: readonly string[] = `::=`.split(' ');
	static readonly PUNCTUATORS_2: readonly string[] = ``.split(' ');
	static readonly PUNCTUATORS_1: readonly string[] = `( ) < > + - * # ? . & | , ;`.split(' ');
	constructor (lexer: Lexer, count: 1n | 2n | 3n | 4n = 1n) {
		super('PUNCTUATOR', lexer, ...lexer.advance());
		if (count >= 4n) {
			this.advance(3n);
		} else if (count >= 3n) {
			this.advance(2n);
		} else if (count >= 2n) {
			this.advance();
		};
	}
}



export class TokenIdentifier extends Token {
	static readonly START: RegExp = /^[A-Z]$/;
	static readonly REST:  RegExp = /^[A-Za-z0-9_]+$/;
	constructor (lexer: Lexer) {
		super('IDENTIFIER', lexer, ...lexer.advance());
		while (!this.lexer.isDone && TokenIdentifier.REST.test(this.lexer.c0.source)) {
			this.advance();
		};
	}
}



export class TokenCharCode extends Token {
	static readonly START: '#x' = '#x';
	static readonly REST:  RegExp = /^[0-9a-f]+$/;
	constructor (lexer: Lexer) {
		super('CHARCODE', lexer, ...lexer.advance(2n));
		while (!this.lexer.isDone && TokenCharCode.REST.test(this.lexer.c0.source)) {
			this.advance();
		};
	}
}



export class TokenString extends Token {
	static readonly DELIM: '"' = '"';
	constructor (lexer: Lexer) {
		super('STRING', lexer, ...lexer.advance());
		while (!this.lexer.isDone && !Char.eq(TokenString.DELIM, this.lexer.c0)) {
			if (Char.eq(Filebound.EOT, this.lexer.c0)) {
				throw new LexError02(this);
			};
			this.advance();
		}
		// add ending delim to token
		this.advance();
	}
}



export class TokenCharClass extends Token {
	static readonly DELIM_START: '[' = '[';
	static readonly DELIM_END:   ']' = ']';
	constructor (lexer: Lexer) {
		super('CHARCLASS', lexer, ...lexer.advance());
		while (!this.lexer.isDone && !Char.eq(TokenCharClass.DELIM_END, this.lexer.c0)) {
			if (Char.eq(Filebound.EOT, this.lexer.c0)) {
				throw new LexError02(this);
			};
			this.advance();
		}
		// add ending delim to token
		this.advance();
	}
}



export class TokenCommentEBNF extends TokenComment {
	static readonly DELIM_START: '//' = '//';
	static readonly DELIM_END:   '\n' = '\n';
	constructor (lexer: Lexer) {
		super(lexer, TokenCommentEBNF.DELIM_START, TokenCommentEBNF.DELIM_END);
	}
	protected stopAdvancing() {
		return Char.eq(TokenCommentEBNF.DELIM_END, this.lexer.c0);
	}
}

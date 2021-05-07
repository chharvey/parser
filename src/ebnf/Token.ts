import type {Char} from '../scanner/Char';
import {
	Token,
	TokenComment,
} from '../lexer/Token';
import type {Lexer} from '../lexer/Lexer';



export class TokenCommentEBNF extends TokenComment {
	static readonly DELIM_START: '//' = '//';
	static readonly DELIM_END:   '\n' = '\n';
}



export class TokenPunctuator extends Token {
	static readonly PUNCTUATORS_4: readonly string[] = `:::=`.split(' ');
	static readonly PUNCTUATORS_3: readonly string[] = `::=`.split(' ');
	static readonly PUNCTUATORS_2: readonly string[] = ``.split(' ');
	static readonly PUNCTUATORS_1: readonly string[] = `( ) < > + - * # ? . & | , ;`.split(' ');
	constructor (lexer: Lexer, start_char: Char, ...more_chars: Char[]) {
		super('PUNCTUATOR', lexer, start_char, ...more_chars);
	}
}



export class TokenIdentifier extends Token {
	static readonly START: RegExp = /^[A-Z]$/;
	static readonly REST:  RegExp = /^[A-Za-z0-9_]+$/;
	constructor (lexer: Lexer, start_char: Char, ...more_chars: Char[]) {
		super('IDENTIFIER', lexer, start_char, ...more_chars);
	}
}



export class TokenCharCode extends Token {
	static readonly START: '#x' = '#x';
	static readonly REST:  RegExp = /^[0-9a-f]+$/;
	constructor (lexer: Lexer, start_char: Char, ...more_chars: Char[]) {
		super('CHARCODE', lexer, start_char, ...more_chars);
	}
}



export class TokenString extends Token {
	static readonly DELIM: '"' = '"';
	constructor (lexer: Lexer, start_char: Char, ...more_chars: Char[]) {
		super('STRING', lexer, start_char, ...more_chars);
	}
}



export class TokenCharClass extends Token {
	static readonly DELIM_START: '[' = '[';
	static readonly DELIM_END:   ']' = ']';
	constructor (lexer: Lexer, start_char: Char, ...more_chars: Char[]) {
		super('CHARCLASS', lexer, start_char, ...more_chars);
	}
}

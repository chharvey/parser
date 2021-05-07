import type {Char} from '../scanner/Char';
import {
	Token,
	TokenComment,
} from '../lexer/Token';



export class TokenCommentEBNF extends TokenComment {
	static readonly DELIM_START: '//' = '//';
	static readonly DELIM_END:   '\n' = '\n';
}



export class TokenPunctuator extends Token {
	static readonly PUNCTUATORS_4: readonly string[] = `:::=`.split(' ');
	static readonly PUNCTUATORS_3: readonly string[] = `::=`.split(' ');
	static readonly PUNCTUATORS_2: readonly string[] = ``.split(' ');
	static readonly PUNCTUATORS_1: readonly string[] = `( ) < > + - * # ? . & | , ;`.split(' ');
	constructor (start_char: Char, ...more_chars: Char[]) {
		super('PUNCTUATOR', start_char, ...more_chars);
	}
}



export class TokenIdentifier extends Token {
	static readonly START: RegExp = /^[A-Z]$/;
	static readonly REST:  RegExp = /^[A-Za-z0-9_]+$/;
	constructor (start_char: Char, ...more_chars: Char[]) {
		super('IDENTIFIER', start_char, ...more_chars);
	}
}



export class TokenCharCode extends Token {
	static readonly START: '#x' = '#x';
	static readonly REST:  RegExp = /^[0-9a-f]+$/;
	constructor (start_char: Char, ...more_chars: Char[]) {
		super('CHARCODE', start_char, ...more_chars);
	}
}



export class TokenString extends Token {
	static readonly DELIM: '"' = '"';
	constructor (start_char: Char, ...more_chars: Char[]) {
		super('STRING', start_char, ...more_chars);
	}
}



export class TokenCharClass extends Token {
	static readonly DELIM_START: '[' = '[';
	static readonly DELIM_END:   ']' = ']';
	constructor (start_char: Char, ...more_chars: Char[]) {
		super('CHARCLASS', start_char, ...more_chars);
	}
}

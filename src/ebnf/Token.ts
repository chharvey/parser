import type {NonemptyArray} from '../types';
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
	constructor (...chars: NonemptyArray<Char>) {
		super('PUNCTUATOR', ...chars);
	}
}



export class TokenIdentifier extends Token {
	static readonly START: RegExp = /^[A-Z]$/;
	static readonly REST:  RegExp = /^[A-Za-z0-9_]+$/;
	constructor (...chars: NonemptyArray<Char>) {
		super('IDENTIFIER', ...chars);
	}
}



export class TokenCharCode extends Token {
	static readonly START: '#x' = '#x';
	static readonly REST:  RegExp = /^[0-9a-f]+$/;
	constructor (...chars: NonemptyArray<Char>) {
		super('CHARCODE', ...chars);
	}
}



export class TokenString extends Token {
	static readonly DELIM: '"' = '"';
	constructor (...chars: NonemptyArray<Char>) {
		super('STRING', ...chars);
	}
}



export class TokenCharClass extends Token {
	static readonly DELIM_START: '[' = '[';
	static readonly DELIM_END:   ']' = ']';
	constructor (...chars: NonemptyArray<Char>) {
		super('CHARCLASS', ...chars);
	}
}

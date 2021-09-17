import type {NonemptyArray} from '../../src/types';
import type {Char} from '../../src/scanner/Char';
import {
	Token,
	TokenComment,
} from '../../src/lexer/Token';



export class TokenCommentSample extends TokenComment {
}



export class TokenNumber extends Token {
	constructor (...chars: NonemptyArray<Char>) {
		super('NUMBER', ...chars);
	}
}

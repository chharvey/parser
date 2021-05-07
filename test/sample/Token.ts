import type {Char} from '../../src/scanner/Char';
import {
	Token,
	TokenComment,
} from '../../src/lexer/Token';



export class TokenCommentSample extends TokenComment {
}



export class TokenNumber extends Token {
	constructor (start_char: Char, ...more_chars: Char[]) {
		super('NUMBER', start_char, ...more_chars);
	}
}

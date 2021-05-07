import type {Char} from '../../src/scanner/Char';
import {
	Token,
	TokenComment,
} from '../../src/lexer/Token';
import type {Lexer} from '../../src/lexer/Lexer';



export class TokenCommentSample extends TokenComment {
}



export class TokenNumber extends Token {
	constructor (lexer: Lexer, start_char: Char, ...more_chars: Char[]) {
		super('NUMBER', lexer, start_char, ...more_chars);
	}
}

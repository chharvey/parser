import type {
	Token,
} from '../../src/lexer/Token';
import {Terminal} from '../../src/grammar/Terminal';
import * as TOKEN from './Token';



export class TerminalNumber extends Terminal {
	static readonly instance: TerminalNumber = new TerminalNumber();
	match(candidate: Token): boolean {
		return candidate instanceof TOKEN.TokenNumber;
	}
}



export class TerminalOperator extends Terminal {
	static readonly instance: TerminalOperator = new TerminalOperator();
	match(candidate: Token): boolean {
		return candidate.tagname === 'PUNCTUATOR' && /\^|\*|\+/.test(candidate.source);
	}
}

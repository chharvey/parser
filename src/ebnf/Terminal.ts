import type {
	Token,
} from '../lexer/Token';
import {
	Terminal,
} from '../grammar/Terminal';
import * as TOKEN from './Token'



export class TerminalIdentifier extends Terminal {
	static readonly instance: TerminalIdentifier = new TerminalIdentifier();
	match(candidate: Token): boolean {
		return candidate instanceof TOKEN.TokenIdentifier;
	}
}



export class TerminalCharCode extends Terminal {
	static readonly instance: TerminalCharCode = new TerminalCharCode();
	match(candidate: Token): boolean {
		return candidate instanceof TOKEN.TokenCharCode;
	}
}



export class TerminalString extends Terminal {
	static readonly instance: TerminalString = new TerminalString();
	match(candidate: Token): boolean {
		return candidate instanceof TOKEN.TokenString;
	}
}



export class TerminalCharClass extends Terminal {
	static readonly instance: TerminalCharClass = new TerminalCharClass();
	match(candidate: Token): boolean {
		return candidate instanceof TOKEN.TokenCharClass;
	}
}

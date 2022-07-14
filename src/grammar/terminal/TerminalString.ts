import type {Token} from '../../lexer/Token';
import * as TOKEN from '../../lexer/token/index';
import {Terminal} from '../Terminal';



export class TerminalString extends Terminal {
	static readonly instance: TerminalString = new TerminalString();
	override match(candidate: Token): boolean {
		return candidate instanceof TOKEN.TokenString;
	}
}

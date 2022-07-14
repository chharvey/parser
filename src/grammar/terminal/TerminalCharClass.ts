import type {Token} from '../../lexer/Token';
import * as TOKEN from '../../lexer/token/index';
import {Terminal} from '../Terminal';



export class TerminalCharClass extends Terminal {
	static readonly instance: TerminalCharClass = new TerminalCharClass();
	override match(candidate: Token): boolean {
		return candidate instanceof TOKEN.TokenCharClass;
	}
}

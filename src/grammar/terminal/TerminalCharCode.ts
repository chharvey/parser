import type {Token} from '../../lexer/Token';
import * as TOKEN from '../../lexer/token/index';
import {Terminal} from '../Terminal';



export class TerminalCharCode extends Terminal {
	static readonly instance: TerminalCharCode = new TerminalCharCode();
	override match(candidate: Token): boolean {
		return candidate instanceof TOKEN.TokenCharCode;
	}
}

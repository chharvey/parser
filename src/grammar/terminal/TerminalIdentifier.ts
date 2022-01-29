import type {Token} from '../../lexer/Token';
import * as TOKEN from '../../lexer/token/index';
import {Terminal} from '../Terminal';



export class TerminalIdentifier extends Terminal {
	static readonly instance: TerminalIdentifier = new TerminalIdentifier();
	override match(candidate: Token): boolean {
		return candidate instanceof TOKEN.TokenIdentifier;
	}
}

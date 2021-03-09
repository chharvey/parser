import * as utils from '../utils';
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
	random(): string {
		let returned: string = utils.randomChar(['A', 'Z']);
		while (utils.randomBool()) {
			returned += utils.randomChar(
				['A', 'Z'],
				['a', 'z'],
				['0', '9'],
				['_', '_'],
			);
		};
		return returned;
	}
}



export class TerminalCharCode extends Terminal {
	static readonly instance: TerminalCharCode = new TerminalCharCode();
	public static random(): string {
		let returned: string = '#x' + utils.randomChar(['0', '9'], ['a', 'f']);
		while (utils.randomBool()) {
			returned += utils.randomChar(['0', '9'], ['a', 'f']);
		};
		return returned;
	}
	match(candidate: Token): boolean {
		return candidate instanceof TOKEN.TokenCharCode;
	}
	random(): string {
		return TerminalCharCode.random();
	}
}



export class TerminalString extends Terminal {
	static readonly instance: TerminalString = new TerminalString();
	match(candidate: Token): boolean {
		return candidate instanceof TOKEN.TokenString;
	}
	random(): string {
		let returned: string = '"';
		while (utils.randomBool()) {
			returned += utils.randomChar(['\u0020', '\u0021'], ['\u0023', '\u007e']); // excluding U+0022
		};
		returned += '"';
		return returned;
	}
}



export class TerminalCharClass extends Terminal {
	static readonly instance: TerminalCharClass = new TerminalCharClass();
	private static char(): string {
		return utils.randomChar(['\u0020', '\u005c'], ['\u005e', '\u007e']); // excluding U+005D
	}
	private static charRange(): string {
		const c1: string = TerminalCharClass.char();
		let c2: string;
		do {
			c2 = TerminalCharClass.char();
		} while (c2.codePointAt(0)! < c1.codePointAt(0)!);
		return `${ c1 }-${ c2 }`;
	}
	private static charCodeRange(): string {
		const c1: string = TerminalCharCode.random();
		let c2: string;
		do {
			c2 = TerminalCharCode.random();
		} while (parseInt(c2.slice(2), 16) < parseInt(c1.slice(2), 16));
		return `${ c1 }-${ c2 }`;
	}
	private static randContents(): string {
		return utils.randomArrayItem([
			TerminalCharClass.char,
			TerminalCharCode.random,
			TerminalCharClass.charRange,
			TerminalCharClass.charCodeRange,
		])();
	}
	match(candidate: Token): boolean {
		return candidate instanceof TOKEN.TokenCharClass;
	}
	random(): string {
		let returned: string = '[';
		if (utils.randomBool()) {
			returned += '^';
		};
		returned += TerminalCharClass.randContents();
		while (utils.randomBool()) {
			returned += TerminalCharClass.randContents();
		};
		returned += ']';
		return returned;
	}
}

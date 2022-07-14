import type {NonemptyArray} from '../../types';
import type {Char} from '../../scanner/Char';
import {Token} from '../Token';



export class TokenCharClass extends Token {
	static readonly DELIM_START: '[' = '[';
	static readonly DELIM_END:   ']' = ']';
	constructor (...chars: NonemptyArray<Char>) {
		super('CHARCLASS', ...chars);
	}
}

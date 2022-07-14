import type {NonemptyArray} from '../../types';
import type {Char} from '../../scanner/Char';
import {Token} from '../Token';



export class TokenString extends Token {
	static readonly DELIM: '"' = '"';
	constructor (...chars: NonemptyArray<Char>) {
		super('STRING', ...chars);
	}
}

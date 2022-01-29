import type {NonemptyArray} from '../../types';
import type {Char} from '../../scanner/Char';
import {Token} from '../Token';



export class TokenCharCode extends Token {
	static readonly START: '#x' = '#x';
	static readonly REST:  RegExp = /^[0-9a-f]+$/;
	constructor (...chars: NonemptyArray<Char>) {
		super('CHARCODE', ...chars);
	}
}

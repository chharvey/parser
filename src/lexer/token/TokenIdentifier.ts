import type {NonemptyArray} from '../../types';
import type {Char} from '../../scanner/Char';
import {Token} from '../Token';



export class TokenIdentifier extends Token {
	static readonly START: RegExp = /^[A-Z]$/;
	static readonly REST:  RegExp = /^[A-Za-z0-9_]+$/;
	constructor (...chars: NonemptyArray<Char>) {
		super('IDENTIFIER', ...chars);
	}
}

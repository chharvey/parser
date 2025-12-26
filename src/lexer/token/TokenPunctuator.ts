import type {NonemptyArray} from '../../types';
import type {Char} from '../../scanner/Char';
import {Token} from '../Token';



export class TokenPunctuator extends Token {
	static readonly PUNCTUATORS_4: readonly string[] = `:::=`.split(' ');
	static readonly PUNCTUATORS_3: readonly string[] = `::=`.split(' ');
	static readonly PUNCTUATORS_2: readonly string[] = `&& ||`.split(' ');
	static readonly PUNCTUATORS_1: readonly string[] = `( ) < > + - ∓ * # ? ! . & | , ;`.split(' ');
	constructor (...chars: NonemptyArray<Char>) {
		super('PUNCTUATOR', ...chars);
	}
}

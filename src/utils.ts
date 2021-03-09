import type {GrammarSymbol} from './grammar/Grammar';
import type {NonemptyArray} from './types';



type RangeNumber = readonly [number, number];
type RangeString = readonly [string, string];



/** Characters representing bounds of a file. */
export enum Filebound {
	/** U+0002 START OF TEXT */
	SOT = '\u0002',
	/** U+0003 END OF TEXT */
	EOT = '\u0003',
}



/**
 * Return a random boolean value.
 * @returns a random boolean value
 */
export function randomBool(): boolean {
	return Math.random() < 0.5;
}



/**
 * Return a random integer from 0 to the argument.
 * @example
 * randomInt(16); // returns a random integer within the interval [0, 16)
 * @param   upper the upper bound, exclusive
 * @returns       a random integer between 0 (inclusive) and `upper` (exclusive)
 */
export function randomInt(upper: number): number;
/**
 * Return a random integer from the lower argument to the upper argument.
 * @example
 * randomInt(16, 32); // returns a random integer within the interval [16, 32)
 * @param   lower the lower bound, inclusive
 * @param   upper the upper bound, exclusive
 * @returns       a random integer between `lower` (inclusive) and `upper` (exclusive)
 */
export function randomInt(lower: number, upper: number): number;
export function randomInt(a: number, b?: number): number {
	if (b === void 0) {
		b = a;
		a = 0;
	};
	return Math.floor(Math.random() * (b - a) + a);
}



/**
 * Return a random code point within the given bound(s) of characters.
 * @example
 * randomInt(['\x04', '\x08'], ['\x16', '\x32']); // returns a random character within the union of the ranges
 * @param   bounds0 the first range to include: a 2-tuple of characters, inclusive
 * @param   bounds  any other ranges to include
 * @returns         a random character within the union of the given ranges
 */
export function randomChar(
	bounds0: RangeString = ['\u0020', '\u007e'],
	...bounds: readonly RangeString[]
): string {
	const ranges: readonly RangeNumber[] = [bounds0, ...bounds].map((bound) => [
		 bound[0].codePointAt(0) || randomInt(0x20,     0x7e),
		(bound[1].codePointAt(0) || randomInt(0x20 - 1, 0x7e - 1)) + 1,
	] as const) as NonemptyArray<RangeNumber>;
	const total_length: number = ranges.reduce((length, range) => length + range[1] - range[0], 0);
	const random: number = Math.random();
	return String.fromCodePoint(Math.floor(ranges

		// map the ranges to their lengths, normalized
		.map((range) => (range[1] - range[0]) / total_length)

		// map the lengths to domains of type `RangeNumber`
		.reduce<RangeNumber[]>((accum, length) => {
			const last_item: RangeNumber = accum[accum.length - 1] || [0, 0];
			return [...accum, [last_item[1], last_item[1] + length]];
		}, [])

		// map the domains to linear functions of the form `y = m(x - h) + k`
		.map(([lower, upper], i) => (lower <= random && random < upper)
			? total_length * (random - lower) + ranges[i][0]
			: null
		)

		// find the function that produced a number
		.find((x): x is number => typeof x === 'number')!
	));
}



/**
 * Return a random item from a nonempty array.
 * @param   array the nonempty array to select from
 * @returns       a random item from the array
 */
export function randomArrayItem<T>(array: Readonly<NonemptyArray<T>>): T {
	return array[randomInt(array.length)];
}



/**
 * Transform `TitleCase` into `MACRO_CASE`.
 * @param   s the string to transform, in `AbcDef` format
 * @returns   the string in `ABC_DEF` format
 */
export function titleToMacro(s: string): string {
	return s.replace(/[A-Z]/g, '_$&').slice(1).toUpperCase();
}



/**
 * Transform `MACRO_CASE` into `TitleCase`.
 * @param   s the string to transform, in `ABC_DEF` format
 * @returns   the string in `AbcDef` format
 */
export function macroToTitle(s: string): string {
	return s.split('_').map((ss) => `${ ss[0] }${ ss.slice(1).toLowerCase() }`).join('');
}



/**
 * Return a map of key-value pairs as a string of XML attributes.
 *
 * For example, given the map `[[key0, value0],  [key1, value1]]`,
 * this method returns the string `key0="value0" key1="value1"`.
 * @param   attributes a map of key-value pairs
 * @returns            an XML string of space-separated attributes
 */
export function stringifyAttributes(attributes: ReadonlyMap<string, string>): string {
	return [...attributes].map(([attr, val]) => `${ attr }="${ val
		.replace(/\&/g, '&amp;' )
		.replace(/\</g, '&lt;'  )
		.replace(/\>/g, '&gt;'  )
		.replace(/\'/g, '&apos;')
		.replace(/\"/g, '&quot;')
		.replace(/\\/g, '&#x5c;')
		.replace(/\t/g, '&#x09;')
		.replace(/\n/g, '&#x0a;')
		.replace(/\r/g, '&#x0d;')
		.replace(Filebound.SOT, '\u2402') // SYMBOL FOR START OF TEXT
		.replace(Filebound.EOT, '\u2403') // SYMBOL FOR END   OF TEXT
		.replace(/[^\u0020-\u007e\u2402-\u2403]/g, (match) => `&#x${ match.codePointAt(0)!.toString(16) };`)
	}"`).join(' ');
}



/**
 * Sanitize a string for the text content of an XML element.
 * @param   contents the original element contents
 * @returns          contents with XML special characters escaped
 */
export function sanitizeContent(contents: string): string {
	return contents
		.replace(/\&/g, '&amp;' )
		.replace(/\</g, '&lt;'  )
		.replace(/\>/g, '&gt;'  )
		.replace(/\\/g, '&#x5c;')
		.replace(Filebound.SOT, '\u2402') // SYMBOL FOR START OF TEXT
		.replace(Filebound.EOT, '\u2403') // SYMBOL FOR END   OF TEXT
	;
}



/**
 * Display a string of grammar symbols for debugging purposes.
 *
 * @param   arr the array of grammar symbols
 * @returns     a string representing the sequence of those symbols
 */
export function stringOfSymbols(arr: readonly GrammarSymbol[]): string {
	return arr.map((symbol) => (typeof symbol === 'string')
		? `"${ symbol }"`
			.replace(Filebound.SOT, '\u2402') // SYMBOL FOR START OF TEXT
			.replace(Filebound.EOT, '\u2403') // SYMBOL FOR END   OF TEXT
		: symbol.displayName
	).join(' ');
}

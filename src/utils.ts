import type {GrammarSymbol} from './grammar/Grammar';



/**
 * A template literal ‘tag’.
 * @example
 * ```
 * declare const tag: TemplateTag;
 * declare const template: unknown;
 * tag`This is a ${ template } literal.`;
 * ```
 */
type TemplateTag<Return, Interps extends unknown[] = unknown[]> =
	(strings: TemplateStringsArray, ...interpolations: Interps) => Return;



/** Characters representing bounds of a file. */
export enum Filebound {
	/** U+0002 START OF TEXT */
	SOT = '\u0002',
	/** U+0003 END OF TEXT */
	EOT = '\u0003',
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
	return s.split('_').map((ss) => ss[0].concat(ss.slice(1).toLowerCase())).join('');
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
 * Dedent a template literal with an auto-determined number of tabs.
 * Remove up to `n` number of tabs from the beginning of each *literal* line in the template literal.
 * Does not affect interpolated expressions.
 * `n` is determined by the number of tabs following the first line break in the literal.
 * If there are no line breaks, `0` is assumed.
 * @example
 * assert.strictEqual(dedent`
 * 			this will be
 * 	dedented by
 * 		up to
 * 				3 tabs
 * `, `
 * this will be
 * dedented by
 * up to
 * 	3 tabs
 * `);
 * @returns a string with each line dedented by the determined number of tabs
 */
export function dedent(strings: TemplateStringsArray, ...interps: unknown[]): string {
	const matched: RegExpMatchArray | null = strings[0].match(/\n\t*/);
	const n: number = matched && matched[0] ? matched[0].slice(1).length : 0;
	function replace(s: string, n: number): string {
		return (n <= 0) ? s : s.replace(new RegExp(`\\n\\t{0,${ Math.floor(n) }}`, 'g'), '\n');
	}
	return [
		...interps.flatMap((interp, i) => [replace(strings[i], n), interp]),
		replace(strings[strings.length - 1], n), // COMBAK strings.lastItem
	].join('');
}
dedent as TemplateTag<string>;



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

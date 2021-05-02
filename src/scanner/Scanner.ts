import {Filebound} from '../utils';
import {Char} from './Char';



/**
 * A Scanner object reads through the source text and returns one character at a time.
 * @see http://parsingintro.sourceforge.net/#contents_item_4.2
 * @final
 */
export class Scanner {
	/**
	 * Construct a new Scanner object.
	 */
	constructor () {
	}

	/**
	 * Return the next character in source text.
	 * @param source the source text
	 * @returns the next character in source text
	 */
	* generate(source: string): Generator<Char> {
		const source_text: string = [Filebound.SOT, '\n', source.replace(/\r\n|\r/g, '\n'), '\n', Filebound.EOT].join('');
		for (let source_index: number = 0; source_index < source_text.length; source_index++) {
			yield new Char(source_text, source_index);
		};
	}
}

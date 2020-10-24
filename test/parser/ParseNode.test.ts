import * as assert from 'assert';

import type {
	EBNFObject,
} from '../../src/types.d';
import {ParseNode} from '../../src/parser/ParseNode';
import {
	ParserSample,
} from '../sample/';



describe('ParseNode', () => {
	describe('.fromJSON', () => {
		it('returns a string representing new subclasses of ParseNode.', () => {
			assert.deepStrictEqual(([
				{
					name: 'Unit',
					defn: [
						[{term: 'NUMBER'}],
						['\'(\'', {term: 'OPERATOR'}, {prod: 'Unit'}, {prod: 'Unit'}, '\')\''],
					],
				},
				{
					name: 'Goal',
					defn: [
						['\'\\u0002\'',                 '\'\\u0003\''],
						['\'\\u0002\'', {prod: 'Unit'}, '\'\\u0003\''],
					],
				},
			] as EBNFObject[]).map((prod) => ParseNode.fromJSON(prod)), [
		`
			export class ParseNodeUnit extends ParseNode {
				declare children:
					readonly [Token] | readonly [Token,Token,ParseNodeUnit,ParseNodeUnit,Token]
				;
			}
		`, `
			export class ParseNodeGoal extends ParseNode {
				declare children:
					readonly [Token,Token] | readonly [Token,ParseNodeUnit,Token]
				;
			}
		`
			]);
		});
	});

	describe('#serialize', () => {
		it('prints a readable string.', () => {
			assert.strictEqual(new ParserSample(`(+ (* 2 3) 5)`).parse().serialize(), `
				<Goal line="0" col="1" source="␂ ( + ( * 2 3 ) 5 ) ␃">
					<FILEBOUND line="0" col="1">␂</FILEBOUND>
					<Unit line="1" col="1" source="( + ( * 2 3 ) 5 )">
						<PUNCTUATOR line="1" col="1">(</PUNCTUATOR>
						<PUNCTUATOR line="1" col="2">+</PUNCTUATOR>
						<Unit line="1" col="4" source="( * 2 3 )">
							<PUNCTUATOR line="1" col="4">(</PUNCTUATOR>
							<PUNCTUATOR line="1" col="5">*</PUNCTUATOR>
							<Unit line="1" col="7" source="2">
								<NUMBER line="1" col="7">2</NUMBER>
							</Unit>
							<Unit line="1" col="9" source="3">
								<NUMBER line="1" col="9">3</NUMBER>
							</Unit>
							<PUNCTUATOR line="1" col="10">)</PUNCTUATOR>
						</Unit>
						<Unit line="1" col="12" source="5">
							<NUMBER line="1" col="12">5</NUMBER>
						</Unit>
						<PUNCTUATOR line="1" col="13">)</PUNCTUATOR>
					</Unit>
					<FILEBOUND line="2" col="1">␃</FILEBOUND>
				</Goal>
			`.replace(/\n\t*/g, ''));
		});
	});
});

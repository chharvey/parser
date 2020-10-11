import * as assert from 'assert';

import {Filebound} from '../../src/utils';
import {
	Token,
	TokenFilebound,
} from '../../src/lexer/Token';
import type {ParseNode} from '../../src/parser/ParseNode';
import {
	ParseError01,
} from '../../src/error/ParseError';
import {
	assert_arrayLength,
} from '../helpers';
import {
	ParserSample,
	ParseNodeUnit,
	ParseNodeGoal,
} from '../sample/';



describe('Parser', () => {
	describe('#parse', () => {
		context('Goal ::= #x02 #x03', () => {
			it('returns only file bounds.', () => {
				const tree: ParseNode = new ParserSample(``).parse();
				assert.strictEqual(tree.children.length, 2);
				tree.children.forEach((child) => assert.ok(child instanceof TokenFilebound));
			});
		});

		it('rejects unexpected tokens.', () => {
			assert.throws(() => new ParserSample(`(+ 3 4 5)`).parse(), ParseError01);
		});

		describe('ParserSample', () => {
			specify('Goal ::= #x02 Unit #x03;', () => {
				const goal: ParseNode = new ParserSample(`(+ (* 2 3) 5)`).parse();
				/*
					<Goal>
						<FILEBOUND>␂</FILEBOUND>
						<Unit src="(+ (* 2 3) 5)">...</Unit>
						<FILEBOUND>␃</FILEBOUND>
					</Goal>
				*/
				assert.ok(goal instanceof ParseNodeGoal);
				assert_arrayLength(goal.children, 3, 'goal should have 3 children');
				const [sot, unit, eot]: readonly [Token, ParseNodeUnit, Token] = goal.children;
				assert.deepStrictEqual(
					[sot.source,    unit.source,         eot.source],
					[Filebound.SOT, `( + ( * 2 3 ) 5 )`, Filebound.EOT],
				);
			});

			specify('Unit ::= "(" OPERATOR Unit Unit ")";', () => {
				const unit: ParseNodeUnit = new ParserSample(`(+ (* 2 3) 5)`).parse().children[1] as ParseNodeUnit;
				/*
					<Unit>
						<PUNCTUATOR>(</PUNCTUATOR>
						<OPERATOR>+</OPERATOR>
						<Unit src="(* 2 3)">...</Unit>
						<Unit src="5">...</Unit>
						<PUNCTUATOR>)</PUNCTUATOR>
					</Unit>
				*/
				assert_arrayLength(unit.children, 5, 'unit should have 5 children');
				const [open, op, left, right, close]: readonly [Token, Token, ParseNodeUnit, ParseNodeUnit, Token] = unit.children;
				assert.deepStrictEqual(
					[open.source, op.source, left.source, right.source, close.source],
					[`(`,         `+`,       `( * 2 3 )`, `5`,          `)`],
				);
			});
		});
	});
});

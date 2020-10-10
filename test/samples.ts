import type {
	NonemptyArray,
	EBNFObject,
} from '../src/types'
import {Char} from '../src/scanner/Char'
import {
	Token,
	TokenComment,
} from '../src/lexer/Token'
import {ParseNode} from '../src/parser/ParseNode'
import {Lexer} from '../src/lexer/Lexer'
import {Parser} from '../src/parser/Parser'
import {Terminal} from '../src/grammar/Terminal'
import {Production} from '../src/grammar/Production'
import {
	GrammarSymbol,
	Grammar,
} from '../src/grammar/Grammar'



/*
Sample objects for testing purposes only.

Lexical Grammar:
```
Punctuator :::= "(" | ")" | "^" | "*" | "+";
Number     :::= [0-9]+;
Comment    :::= "[" [^#5d]* "]"; // any character except U+005d RIGHT SQUARE BRACKET
```

Syntactic Grammar:
```
Unit ::= NUMBER | "(" OPERATOR Unit Unit ")";
Goal ::= #x02 Unit? #x03;
```
*/



export const grammar: EBNFObject[] = JSON.parse(`
	[
		{
			"name": "Unit",
			"defn": [
				[{"term": "NUMBER"}],
				["'('", {"term": "OPERATOR"}, {"prod": "Unit"}, {"prod": "Unit"}, "')'"]
			]
		},
		{
			"name": "Goal",
			"defn": [
				["'\\\\u0002'",                   "'\\\\u0003'"],
				["'\\\\u0002'", {"prod": "Unit"}, "'\\\\u0003'"]
			]
		}
	]
`);



export class MyTokenNumber extends Token {
	constructor (lexer: Lexer) {
		super('NUMBER', lexer, ...lexer.advance());
		while (!this.lexer.isDone && /[0-9]/.test(this.lexer.c0.source)) {
			this.advance();
		};
	}
}

export class MyTokenComment extends TokenComment {
	constructor (lexer: Lexer) {
		super(lexer, '[', ']');
	}
	protected stopAdvancing(): boolean {
		return Char.eq(']', this.lexer.c0);
	}
}



export class ParseNodeUnit extends ParseNode {
	declare children:
		| readonly [Token]
		| readonly [Token, Token, ParseNodeUnit, ParseNodeUnit, Token]
	;
}
export class ParseNodeGoal extends ParseNode {
	declare children:
		| readonly [Token, Token]
		| readonly [Token, ParseNodeUnit, Token]
	;
}



export class MyLexer extends Lexer {
	protected generate_do(): Token | null {
		return (Char.inc(['(', ')', '^', '*', '+'], this.c0)) ?
			new Token('PUNCTUATOR', this, ...this.advance())
		: (/[0-9]/.test(this.c0.source)) ?
			new MyTokenNumber(this)
		: (Char.eq('[', this.c0)) ?
			new MyTokenComment(this)
		: null;
	}
}



export class MyParser extends Parser {
	constructor (source: string) {
		super(source, MyLexer, new Grammar([
			ProductionUnit.instance,
			ProductionGoal.instance,
		], ProductionGoal.instance), new Map<Production, typeof ParseNode>([
			[ProductionUnit.instance, ParseNodeUnit],
			[ProductionGoal.instance, ParseNodeGoal],
		]));
	}
}



export class TerminalNumber extends Terminal {
	static readonly instance: TerminalNumber = new TerminalNumber();
	match(candidate: Token): boolean {
		return candidate instanceof MyTokenNumber;
	}
}

export class TerminalOperator extends Terminal {
	static readonly instance: TerminalOperator = new TerminalOperator();
	match(candidate: Token): boolean {
		return candidate.tagname === 'PUNCTUATOR' && /\^|\*|\+/.test(candidate.source);
	}
}



export class ProductionUnit extends Production {
	static readonly instance: ProductionUnit = new ProductionUnit();
	get sequences(): NonemptyArray<NonemptyArray<GrammarSymbol>> {
		return [
			[TerminalNumber.instance],
			['(', TerminalOperator.instance, ProductionUnit.instance, ProductionUnit.instance, ')'],
		];
	}
}
export class ProductionGoal extends Production {
	static readonly instance: ProductionGoal = new ProductionGoal();
	get sequences(): NonemptyArray<NonemptyArray<GrammarSymbol>> {
		return [
			['\u0002', '\u0003'],
			['\u0002', ProductionUnit.instance, '\u0003'],
		];
	}
}

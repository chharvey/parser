# parser
A parser generator.



## Usage


### Step 1: Define A Lexicon
The lexicon of your language describes how tokens are formed from a string of characters.
In formal language theory, a lexicon is defined by a Regular Grammar and governed by a “finite state automaton”
(Type-3 in the [Chomsky Hierarchy](https://en.wikipedia.org/wiki/Chomsky_hierarchy)).

In this walkthrough we’ll define a simple s-expression language using only positive integers and
the operators `^`, `*`, and `+`.
For example, to write “the sum of 500 and the product of 2 and 30”, you would write `(+ 500 (* 2 30))`.
(Conventionally, this would be written `500 + 2 * 30`.)
Being such a simple language, there are only three types of tokens: numbers, operators, and grouping symbols.
The lexicon of this language is described by the following EBNF:
```
NUMBER   :::= [0-9]+;
OPERATOR :::= "^" | "*" | "+";
GROUPING :::= "(" | ")";
```

In practice, you’d implement a lexicon by writing a combination of loops and conditional statements.
This is called a lexer, and the process is called Lexical Analysis.
*(Pseudo-code below — do not take seriously!)*
```ts
const input: string = '(+ 500 (* 2 30))';
let i: number = 0;
let current_character: string = input[i];
function advance(t: string): void {
	t += current_character;
	current_character = input[++i];
}

const tokens: string[] = [];
while (i < input.length) {
	let token: string = '';

	/* WHITESPACE */
	while (/\s/.test(current_character)) {
		advance(token);
	}

	/* NUMBER :::= [0-9]+; */
	while (/[0-9]/.test(current_character)) {
		advance(token);
	};

	/* OPERATOR :::= "^" | "*" | "+"; */
	if (/\^|\*|\+/.test(current_character)) {
		advance(token);
	};

	/* GROUPING :::= "(" | ")"; */
	if (/\(|\)/.test(current_character)) {
		advance(token);
	};

	tokens.push(token);
};
```
Once done, and after filtering out whitespace, the lexer would return the following sequence of tokens:
```ts
['(', '+', '500', '(', '*', '2', '30', ')', ')']
```
(Note that a lexer only creates tokens, it does not care how they are arranged.
Thus the following code would lex sucessfully even if not syntactically well-formed:
`500) + *(2 30 ()`.)

Hopefully the pseudo-code above gave you a good idea of lexical analysis,
but unfortunatly it’s not that simple.
To define a usable lexer, extend this project’s `Lexer` class, and write your own token classes using `Token`.

#### Step 1a: Define Token Types
First let’s tackle the tokens. Each kind of token (`NUMBER`, `OPERATOR`, `GROUPING`) must be a subclass of `Token`,
where the constructor takes a lexer and the first character of the token, and then
describes what the lexer should do next. See the [Token API](./docs/api/) for details.
```ts
//-- file: Token.ts
import {
	Token,
	Lexer,
} from '@chharvey/parser';

/** NUMBER :::= [0-9]+; */
class TokenNumber extends Token {
	constructor (lexer: Lexer) {
		super('NUMBER', lexer, ...lexer.advance()); // already contains the 1st character
		while (!this.lexer.isDone && /[0-9]/.test(this.lexer.c0.source)) {
			this.advance();
		};
	}
}
/** OPERATOR :::= "^" | "*" | "+"; */
class TokenOperator extends Token {
	constructor (lexer: Lexer) {
		super('OPERATOR', lexer, ...lexer.advance()); // already contains the 1st character
		// since only 1 character, no need to advance
	}
}
/** GROUPING :::= "(" | ")"; */
class TokenGrouping extends Token {
	constructor (lexer: Lexer) {
		super('GROUPING', lexer, ...lexer.advance()); // already contains the 1st character
		// since only 1 character, no need to advance
	}
}
```

#### Step 1b: Define The Lexer
The name of your lexer must be `Lexer‹id›`, where `‹id›` is some identifier. Here we’ll use `LexerSExpr`.
(The `‹id›` is important because we’ll use it when generating our parser later.)
Put the conditions of the psuedo-code above into this lexer’s `generate_do()` method.
```ts
//-- file: Lexer.ts
import {
	Char,
	Token,
	Lexer,
} from '@chharvey/parser';
import * as TOKEN from './Token';

class LexerSExpr extends Lexer {
	protected generate_do(): Token | null {
		return (
			(/[0-9]/.test(this.c0.source))       ? TOKEN.TokenNumber  (this) :
			(Char.inc(['^', '*', '+'], this.c0)) ? TOKEN.TokenOperator(this) :
			(Char.inc(['(', ')'],      this.c0)) ? TOKEN.TokenGrouping(this) :
			null
		);
	}
}
```

If we want to check if our lexer is working property, we can call its `generate()` method,
which returns a generator of tokens.
```ts
function testLexer(): void {
	console.log([...new LexerSExpr('(+ 500 (* 2 30))').generate()].map((token) => token.serialize()));
}
```
We can expect this sequence of tokens:
```xml
<FILEBOUND>&#x02;</FILEBOUND>
<GROUPING>(</GROUPING>
<OPERATOR>+</OPERATOR>
<NUMBER>5</NUMBER>
<GROUPING>(</GROUPING>
<OPERATOR>*</OPERATOR>
<NUMBER>2</NUMBER>
<NUMBER>3</NUMBER>
<GROUPING>)</GROUPING>
<GROUPING>)</GROUPING>
<FILEBOUND>&#x03;</FILEBOUND>
```


### Step 2: Define A Syntax
A language’s syntax describes how tokens should be arranged into a tree (called a parse tree).
A syntax is defined by a Context-Free Gramar and governed by a “non-deterministic pushdown automaton”
(Type-2 in the [Chomsky Hierarchy](https://en.wikipedia.org/wiki/Chomsky_hierarchy)).

With step 1, we had to write everything by hand. (I haven’t gotten around to automating that step yet.)
Thankfully, step 2 is all automatic, which is good because defining a syntax by hand is *a lot* of work.
That’s why this project exists! I could probably go on forever about how parsers and this parser generator work.
But suffice it to say, the parser generator reads and parses EBNF, using a parser that it itself generates.

To get started, create an EBNF file defining the syntax of your language.
For example, our s-expression language is defined like this:
```
//-- file: syntax.ebnf

Unit
	::= NUMBER | "(" OPERATOR Unit Unit ")";

Goal
	::= #x02 Unit? #x03;
```

Formatting conventions:
- Terminal literals (strings) are enclosed in `"double-quotes"`.
- Terminal variables (defined separately in our lexical grammar) are in `MACRO_CASE`.
- Nonterminal variables are in `TitleCase`.
- A `Goal` symbol must exist, and must start with `#x02` (**U+0002 START OF TEXT**) and end with `#x03` (**U+0003 END OF TEXT**).
- Comments are like `// line comments in js`.
- For more details, see the [specification](./docs/spec/notation.md).

Before we can use our parser, it needs to be generated first.
This project’s generator takes an EBNF string and outputs another string in TypeScript format,
which we’ll write to file.
```ts
//-- file: main.ts
import * as fs from 'fs';
import * as path from 'path';
import {
	generate,
} from '@chharvey/parser';

async function beforeRun(): void {
	const grammar: Promise<string> = fs.promises.readFile(path.join(__dirname, './syntax.ebnf'), 'utf8');
	await fs.promises.writeFile(
		path.join(__dirname, './Parser.auto.ts'),
		generate(await grammar, 'SExpr'), // custom identifier from our lexer name
	);
}
```

After our parser and all its components are written to file, even though it’s auto-generated,
it’s a good idea to check it in to version control.
This is because you’ll import from it when using it:
```ts
//-- file: main.ts
import {ParserSExpr} from './Parser.auto';

function run(): void {
	console.log(new ParserSExpr('(+ 5 (* 2 3))').parse().serialize());
}
```
We can expect a parse tree like the following:
```xml
<Goal>
	<FILEBOUND>&#x02;</FILEBOUND>
	<Unit>
		<GROUPING>(</GROUPING>
		<OPERATOR>+</OPERATOR>
		<Unit>
			<NUMBER>5</NUMBER>
		</Unit>
		<Unit>
			<GROUPING>(</GROUPING>
			<OPERATOR>*</OPERATOR>
			<Unit>
				<NUMBER>2</NUMBER>
			</Unit>
			<Unit>
				<NUMBER>3</NUMBER>
			</Unit>
			<GROUPING>)</GROUPING>
		</Unit>
		<GROUPING>)</GROUPING>
	</Unit>
	<FILEBOUND>&#x03;</FILEBOUND>
</Goal>
```

# [parser](https://chharvey.github.io/parser/docs/api/)
A parser generator.



## Usage


### Step 1: Define A Lexicon
The lexicon of your language describes how tokens are formed from a string of characters.
In formal language theory, a lexicon is defined by a Regular Grammar and governed by a “finite state automaton”
(Type-3 in the [Chomsky Hierarchy](https://en.wikipedia.org/wiki/Chomsky_hierarchy)).

In this walkthrough we’ll define a simple s-expression language using only positive integers and
the binary operators `^`, `*`, and `+`.
For example, to write “the sum of 500 and the product of 2 and 30”, you would write
```
(+ 500 (* 2 30))
```
(Conventionally, this would be written as `500 + 2 * 30`.)
Being such a simple language, there are only three types of tokens: numbers, operators, and grouping symbols.
The lexicon of this language is described by the following EBNF:
```
NUMBER
	:::= [0-9]+;

OPERATOR
	:::= "^" | "*" | "+";

GROUPING
	:::= "(" | ")";
```

In practice, you’d implement a lexicon by writing a combination of loops and conditional statements.
This is called a lexer, and the process is called Lexical Analysis.
*(Pseudo-code below — do not take seriously!)*
```ts
const input: string = '(+ 500 (* 2 30))';
let i: number = 0;
let current_character: string = input[i];
function advance(t: string): string {
	t += current_character;
	current_character = input[++i];
	return t;
}

const tokens: string[] = [];
while (i < input.length) {
	let token: string = '';

	/* WHITESPACE */
	while (/\s/.test(current_character)) {
		token = advance(token);
	};
	if (token !== '') {
		tokens.push(token);
		continue;
	};

	/* NUMBER :::= [0-9]+; */
	while (/[0-9]/.test(current_character)) {
		token = advance(token);
	};
	if (token !== '') {
		tokens.push(token);
		continue;
	};

	/* OPERATOR :::= "^" | "*" | "+"; */
	if (/\^|\*|\+/.test(current_character)) {
		token = advance(token);
	};
	if (token !== '') {
		tokens.push(token);
		continue;
	};

	/* GROUPING :::= "(" | ")"; */
	if (/\(|\)/.test(current_character)) {
		token = advance(token);
	};
	if (token !== '') {
		tokens.push(token);
		continue;
	};

	throw new Error(`Unrecognized character: \`${ current_character }\``);
};
```
Once done, and after filtering out whitespace, the lexer would return the following sequence of tokens:
```ts
['(', '+', '500', '(', '*', '2', '30', ')', ')']
```
(Note that a lexer only creates tokens, it does not care how they are arranged.
Thus the following code would lex sucessfully even if not syntactically well-formed:
`500) + *(2 30 ()`.)

The pseudo-code above outlines the basic concept of lexical analysis,
but to define a usable lexer with this project, you’ll need to extend
its `Token` and `Lexer` classes.

#### Step 1a: Define The Lexer
The name of our lexer instance must be `LEXER`. (Use all-caps since it’s a constant.
This name is required because it’s used when generating our parser later.)
Each kind of token (`NUMBER`, `OPERATOR`, `GROUPING`) should correspond to a subroutine
that describes what the lexer should do next.
Whitespace tokens are already taken care of, so we don’t need to write it ourselves.
(Thus this project *should not* be used for whitespace-sensitive languages.)
Put the conditions of the psuedo-code above into this lexer’s `generate_do()` method.
See the [Lexer API](./docs/api/) for details.
```ts
//-- file: Lexer.ts
import {
	NonemptyArray,
	Char,
	Token,
	Lexer,
} from '@chharvey/parser';

class LexerSExpr extends Lexer {
	protected generate_do(): Token | null {
		if (/[0-9]/.test(this.c0.source)) {
			/** NUMBER :::= [0-9]+; */
			const buffer: NonemptyArray<Char> = [...this.advance()];
			while (!this.isDone && /[0-9]/.test(this.c0.source)) {
				buffer.push(...this.advance());
			};
			return new Token('NUMBER', ...buffer);

		} else if (Char.inc(['^', '*', '+'], this.c0)) {
			/** OPERATOR :::= "^" | "*" | "+"; */
			return new Token('OPERATOR', ...this.advance()); // since only 1 character, no need for buffer

		} else if (Char.inc(['(', ')'], this.c0)) {
			/** GROUPING :::= "(" | ")"; */
			return new Token('GROUPING', ...this.advance()); // since only 1 character, no need for buffer

		} else {
			return null;
		};
	}
}

export const LEXER: LexerSExpr = new LexerSExpr();
```

If we want to check if our lexer is working property, we can call its `generate()` method,
which returns a generator of tokens.
```ts
function testLexer(): void {
	const tokens: Token[] = [...LEXER.generate('(+ 500 (* 2 30))')];
	console.log(tokens.map((t) => t.serialize()));
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
Thankfully, most of step 2 is all automatic, which is good because defining a syntax by hand is *a lot* of work.
That’s why this project exists! I could probably go on forever about how parsers and this parser generator work.
But suffice it to say, the parser generator reads and parses EBNF, using a parser that it itself generates.

#### Step 2a: Write The Syntax Grammar
To get started, create an EBNF file defining the syntax of your language.
For example, our s-expression language is defined like this:
```
//-- file: syntax.ebnf

Unit
	::= NUMBER | "(" OPERATOR Unit Unit ")";

Goal
	::= #x02 Unit? #x03;
```

EBNF Formatting conventions:
- Terminal literals (strings) are enclosed in `"double-quotes"`.
- Terminal variables (defined separately in our lexical grammar) are in `MACRO_CASE`.
- Nonterminal variables are in `TitleCase`.
- A `Goal` symbol must exist, and must start with `#x02` (**U+0002 START OF TEXT**) and end with `#x03` (**U+0003 END OF TEXT**).
- Comments are like `// line comments in js`.
- For more details, see the [specification](./docs/spec/notation.md).

Notice that the terminal variables in our syntax correspond roughly to the token types in our lexicon.
There doesn’t need to be a one-to-one relationship. For example, you might have a single
lexical token type, `NUMBER`, responsible for both integers and floats,
but maybe you want to split them up in your syntax into two terminal types `INTEGER` and `FLOAT`.

#### Step 2b: Define Terminal Types
We’ll need to define our terminal types by hand by extending `Terminal`.
The good news is that there’s only one method to override.
```ts
//-- file: Terminal.ts
import {
	Terminal,
} from '@chharvey/parser';
import * as TOKEN from './Token';

export class TerminalNumber extends Terminal {
	static readonly instance: TerminalNumber = new TerminalNumber();
	match(candidate: Token): boolean {
		return candidate instanceof TOKEN.TokenNumber;
	}
}
export class TerminalOperator extends Terminal {
	static readonly instance: TerminalOperator = new TerminalOperator();
	match(candidate: Token): boolean {
		return candidate instanceof TOKEN.TokenOperator;
	}
}
```
Don’t worry about the static `instance` field; this is required for logistical reasons
but I’m working on a way to get rid of it.
The important thing is to define the `match()` method, which decides whether a given lexical token
satisfies the syntactic terminal type. This method is used by the parser.

Another thing: the name of your terminal subclasses must be `Terminal‹id›`,
where `‹id›` is the TitleCase name of the terminal variable in your EBNF.
For example, if your grammar has a terminal called `STRING`, then your subclass must be named `TerminalString`.
With underscores: A terminal `ABC_DEF` corresponds to the classname `TerminalAbcDef`.
The reason naming is important here is that the parser reads these classes programmatically.

As stated above, there need not be an exact one-to-one correspondance between token types and terminals —
notice that we don’t need to define a terminal type for grouping symbols,
since they’re just literals in the syntax grammar.

#### Step 2c: Generate and Use The Parser
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
		generate(await grammar),
	);
}
```
For an example of this output, see [this project’s sample parser](./test/sample/Parser.auto.ts).

After our parser and all its components are written to file, even though it’s auto-generated,
it’s a good idea to check it in to version control.
This is because you’ll import from it when using it:
```ts
//-- file: main.ts
import {PARSER} from './Parser.auto';

function run(): void {
	const tree = PARSER.parse('(+ 5 (* 2 3))');
	console.log(tree.serialize());
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

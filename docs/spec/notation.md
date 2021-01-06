# Grammar Notation
This specification uses a variant of [W3C’s EBNF syntax](https://www.w3.org/TR/xml/#sec-notation)
to notate the formal grammars of a language.

The [EBNF syntax grammar](../../src/ebnf/syntax.ebnf) describes the formal Context-Free Grammar notation.
It is self-describing; that is, it describes the very syntax it uses.
The non-literal terminal symbols of this syntax grammar are defined in
a separate [lexical grammar](../../src/ebnf/lexicon.ebnf).

Each production in a Grammar consists of a nonterminal followed by a choice of one or more sequences.
```
‹ProductionName›
	::= ‹Choice›;
```
where `‹ProductionDefinition›` and `‹Choice›` are meta-variables repesenting structures in the grammar.
`‹ProductionName›` represents a name of the nonterminal being defined,
and `‹Choice›` represents any sequence of symbols that may replace the nonterminal,
or a choice of such sequences.

For brevity, we may use the format
```
‹ProductionDefinition› ::= ‹Choice›;
```

The production definition is followed by a definition symbol `:::=` or `::=`, and the production is ended by `;`.
The symbol `:::=` is used in lexical grammars and the symbol `::=` is used in syntactic grammars.
In this section, we will use `::=` in the absense of context.

The nonterminal representative `‹Choice›` may define one or more alternatives
for **sequences** that replace the nonterminal `‹ProductionDefinition›`.
In that case, we delimit the sequences with pipes (**U+007C**),
and place each sequence on its own line.
```
‹ProductionDefinition› ::=
	| ‹Sequence1›
	| ‹Sequence2›
	| ‹Sequence3›
;
```
In this format, the pipes are to be thought of as *delimiters* rather than as *operators*,
though [they serve the same purpose](#alternation).
The list of sequences may begin with a leading pipe as shown above.

When describing Grammars, this specification uses PascalCase (TitleCase) to denote nonterminal symbols,
"double quotes" to denote literal terminals, and MACRO_CASE to denote non-literal terminal symbols.
For example, the following production defines a nonterminal `PrimitiveLiteral`,
which during syntactical analysis is replaced by one of five alternatives:
one of the terminal literals `"null"`, `"false"`, or `"true"`, or one of the terminal symbols `INTEGER` or `FLOAT`.
The latter two symbols are not literal spans of code, but rather productions defined by a separate lexical grammar.
(E.g., `INTEGER` could be defined lexically as `[0-9]+`.)
```
PrimitiveLiteral ::=
	| "null"
	| "false"
	| "true"
	| INTEGER
	| FLOAT
;
```

A **sequence** of symbols in a CFG is defined as a list of symbols
that may replace a nonterminal in exactly the same order.
Symbols in a sequence are concatenated with only whitespace separating them.
```
ExpressionUnit
	::= "(" Expression ")";
```
During syntactical analysis, the nonterminal `ExpressionUnit` may be replaced by
the terminal `"("`, followed by the nonterminal `Expression`, followed by the terminal `")"`.

EBNF **comments** are snippets of text ignored by any EBNF parser;
they can be used to insert human-readable descriptions.
Comments are written `// in C-style line comment syntax`,
and, if present, must appear at the end of a line.



## Operations
This specification supplements the formal EBNF grammar described above
with an operational shorthand syntax to ease readability and length.
Specifically, the supplemented symbols include `( ) . & | + * # ?`.

This supplemental shorthand notation does not alter or add new semantics
to the formal EBNF grammar, but merely provides a route to transform productions
from their shorthand form to a number of productions in their formal form.

These shorthand notations are described in the following subsections.


### Summary
The following table is an informative summary of the operators described below.

<table>
	<thead>
		<tr>
			<th>Precedence<br/><small>(1 is highest)</small></th>
			<th>Operator Name</th>
			<th>Arity &amp; Position</th>
			<th>Grouping</th>
			<th>Symbols</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th>1</th>
			<td>Grouping</td>
			<td>unary wrap</td>
			<td>(n/a)</td>
			<td><code>( … )</code></td>
		</tr>
		<tr>
			<th rowspan="3">2</th>
			<td>Repetition</td>
			<td rowspan="3">unary postfix</td>
			<td rowspan="3">left-to-right</td>
			<td><code>… +</code></td>
		</tr>
		<tr>
			<td>Optional Repetition</td>
			<td><code>… *</code></td>
		</tr>
		<tr>
			<td>Comma-Separated Repition</td>
			<td><code>… #</code></td>
		</tr>
		<tr>
			<th>3</th>
			<td>Optionality</td>
			<td>unary postfix</td>
			<td>left-to-right</td>
			<td><code>… ?</code></td>
		</tr>
		<tr>
			<th rowspan="2">4</th>
			<td>Ordered Concatenation</td>
			<td rowspan="2">binary infix</td>
			<td rowspan="2">left-to-right</td>
			<td><code>… …</code></td>
		</tr>
		<tr>
			<td>Ordered Concatenation (Explicit)</td>
			<td><code>… . …</code></td>
		</tr>
		<tr>
			<th>5</th>
			<td>Unordered Concatenation</td>
			<td>binary infix</td>
			<td>left-to-right</td>
			<td><code>… & …</code></td>
		</tr>
		<tr>
			<th>6</th>
			<td>Alternation</td>
			<td>binary infix</td>
			<td>left-to-right</td>
			<td><code>… | …</code></td>
		</tr>
	</tbody>
</table>


### Grouping
Grouping of symbols promotes the precedence of operations listed in the subsequent sections.

Grouping syntax uses the delimiters `( … )`.
```
N
	::= A (B C) D;
```


### Ordered Concatenation
Ordered Concatenation is exactly the same as a sequence of symbols as described above.

Ordered Concatenation syntax uses the optional symbol `.`, but it is equivalent to whitespace.
```
N
	::= A . B;
```
is equivalent to
```
N
	::= A B;
```

Usage of an explicit operator can help control grouping and separation of items in a sequence.


### Unordered Concatenation
Unordered Concatenation of symbols is concatenation where the order is not important.

Unordered Concatenation syntax uses the symbol `&` and is shorthand for an alternative choice with concatenation:
```
N
	::= A & B;
```
transforms to
```
N ::=
	| A B
	| B A
;
```

Unordered Concatenation is evaluated left-to-right, so the EBNF expression `A & B & C`
is equivalent to `(A & B) & C`.
```
N
	::= A & B & C;
```
transforms to
```
N ::=
	| (A & B) C
	| C (A & B)
;
```
which in turn transforms to
```
N ::=
	| A B C
	| B A C
	| C A B
	| C B A
;
```
**(Notice that not all permutations are available here — namely, `A C B` and `B C A` are missing.)**

Unordered Concatenation is weaker than concatenation:
`A & B C` is equivalent to `A & (B C)`.


### Alternation
Alternation of symbols indicates an alternative choice of those symbols in the formal grammar.

Alteration syntax uses the symbol `|` and is shorthand for an alternative choice for a production:
```
N
	::= A | B;
```
transforms to
```
N ::=
	| A
	| B
;
```

Alternation is evaluated left-to-right, so the EBNF expression `A | B | C`
is equivalent to `(A | B) | C`.
```
N
	::= A | B | C;
```
transforms to
```
N ::=
	| A | B
	| C
;
```
which in turn transforms to
```
N ::=
	| A
	| B
	| C
;
```

Alternation is weaker than Unordered Concatenation:
`A | B & C` is equivalent to `A | (B & C)`.

Alternation on its own is not that interesting, but it can be useful when combined with other operations:
```
N ::= (A | B) C;
```
is shorthand for
```
N ::=
	| A C
	| B C
;
```


### Repetition
Repetition indicates one or more occurrences of a symbol in the formal grammar.

Repetition syntax uses the symbol `+` and is shorthand for a left-recursive list:
```
N
	::= A B+;
```
transforms to
```
N ::=
	| A N__0__List
;

N__0__List ::=
	| B
	| N__0__List B
;
```

Repetition is stronger than concatenation:
`A B+` is equivalent to `A (B+)`.


### Optional Repetition
Optional repetition is the repetition of zero or more occurrences of a symbol on the formal grammar.

Optional repetition uses the symbol `*` and is shorthand for a repetition that may be present or absent:
```
N
	::= A B*;
```
transforms to
```
N ::=
	| A
	| A N__0__List
;

N__0__List ::=
	| B
	| N__0__List B
;
```

Optional repetition is stronger than concatenation:
`A B*` is equivalent to `A (B*)`.


### Comma-Separated Repetition
Comma-separated repetition is a repetition of one or more items with commas (**U+002C**) in between them.
Comma-separated repetition only specifies commas *between* the items, but does not necessarily
specify a leading or trailing comma.

Comma-separated repetition syntax uses the symbol `#` and is shorthand for a left-recursive list.
```
N
	::= A B#;
```
transforms to
```
N ::=
	| A N__0__List
;

N__0__List ::=
	| B
	| N__0__List "," B
;
```

Comma-separated repetition is stronger than concatenation:
`A B#` is equivalent to `A (B#)`.


### Optionality
Optionality indicates that the symbol may be present or absent in the formal grammar.

Optionality syntax uses the symbol `?` and is shorthand for an alternative choice:
```
N
	::= A B?;
```
transforms to
```
N ::=
	| A
	| A B
;
```

Optionality is stronger than concatenation:
`A B?` is equivalent to `A (B?)`.
However, it is the weakest of all unary operators:
`C+?`, `D*?`, and `E#?` are respectively equivalent to `(C+)?`, `(D*)?`, and `(E#)?`.



## Parameterized Productions
Parameterized productions are syntax sugar for decreasing the
amount and effort of hand-written productions.
These are not new features; they are only shorthand notation that
reduce to the normative notation described at the beginning of this section.


### Production Parameters
A parameter of a nonterminal on the left-hand side of a production
takes the form of an identifier, which expands the production into two productions.
```
N<X>
	::= A;
```
transforms to
```
N   ::= A;
N_X ::= A;
```
Production parameters expand combinatorially.
```
N<X, Y>
	::= A;

M<Z><W>
	::= B;
```
transforms to
```
N     ::= A;
N_X   ::= A;
N_Y   ::= A;
N_X_Y ::= A;

M     ::= B;
M_Z   ::= B;
M_W   ::= B;
M_Z_W ::= B;
```
Therefore, a nonterminal on the left-hand side `P<F, G>` is equivalent to `P<F><G>`.


### Production Arguments
When a parameterized production is referenced as a nonterminal on the right-hand side,
identifiers are sent as arguments, which determine the production used.
```
N ::=
	| A<+X>
	| B<-X>
;

M<Y>
	::= C<?Y>;
```
transforms to
```
N ::=
	| A_X
	| B
;

M   ::= C;
M_Y ::= C_Y;
```
Production arguments expand combinatorially, the same way parameters do.
```
N ::=
	| I<-X, +X>
	| J<+Y, -Y>
	| K<-X><+X>
	| L<+Y><-Y>
;

M ::=
	| A<+X, +Y>
	| B<+X, -Y>
	| C<-X, +Y>
	| D<-X, -Y>
	| E<+X><+Y>
	| F<+X><-Y>
	| G<-X><+Y>
	| H<-X><-Y>
;

O<Z, W> ::=
	| P<?Z, ?W>
	| Q<?Z><?W>
;
```
transforms to
```
N ::=
	| I
	| I_X
	| J_Y
	| J
	| K_X
	| L_Y
;

M ::=
	| A_X
	| A_Y
	| A_X_Y
	| B_X
	| B
	| C
	| C_Y
	| D
	| E_X_Y
	| F_X
	| G_Y
	| H
;

O ::=
	| P
	| Q
;
O_Z ::=
	| P_Z
	| Q_Z
;
O_W ::=
	| P_W
	| Q_W
;
O_Z_W ::=
	| P_Z_W
	| Q_Z_W
;
```
Notice that a nonterminal on the right-hand side `P<⊛F, ⊗G>` is *not* equivalent to `P<⊛F><⊗G>`.
(`⊛` and `⊗` are metavariables representing one of the symbols `+` and `-`.)
The former (`P<⊛F, ⊗G>`) acts like a disjunction (`P<⊛F> | P<⊗G> | P<⊛F><⊗G>`), while
the latter (`P<⊛F><⊗G>`) acts like a conjunction (only `P<⊛F><⊗G>`).

However, a nonterminal on the right-hand side `P<?F, ?G>` *is* equivalent to `P<?F><?G>`.


### Production Conditionals
A production conditional determines whether or not an item appears in the sequence of a production.
```
N<X> ::=
	| A
	| <X+>B
	| <X->C
;
```
transforms to
```
N ::=
	| A
	| C
;
N_X ::=
	| A
	| B
;
```
Production conditionals expand combinatorially.
```
N<X, Y> ::=
	| A
	| <X+>B
	| <X->C
	| <Y+>D
	| <Y->E
	| <X+, Y+>F
	| <X+, Y->G
	| <X-, Y+>H
	| <X-, Y->I
	| <X+><Y+>J
	| <X+><Y->K
	| <X-><Y+>L
	| <X-><Y->M
;

O<X> ::=
	| <X+, X+>P
	| <X+, X->Q
	| <X-, X+>R
	| <X-, X->S
	| <X+><X+>T
	| <X+><X->U
	| <X-><X+>V
	| <X-><X->W
;
```
transforms to
```
N ::=
	| A
	| C
	| E
	| G
	| H
	| I
	| M
;
N_X ::=
	| A
	| B
	| E
	| F
	| G
	| I
	| K
;
N_Y ::=
	| A
	| C
	| D
	| F
	| H
	| I
	| L
;
N_X_Y ::=
	| A
	| B
	| D
	| F
	| G
	| H
	| J
;


O ::=
	| Q
	| R
	| S
	| W
;
O_X ::=
	| P
	| Q
	| R
	| T
;
```
Notice that the conditional `<F⊛, G⊗>P` is *not* equivalent to `<F⊛><G⊗>P`.
(`⊛` and `⊗` are metavariables representing one of the symbols `+` and `-`.)
The former acts like a union whereas the latter acts like an intersection.

This informative table summarizes the right-hand side appearances.

|           | N   | N_X   | N_Y   | N_X_Y
----------- | --- | ----- | ----- | ------
`A`         | `N` | `N_X` | `N_Y` | `N_X_Y`
`<X+>B`     |     | `N_X` |       | `N_X_Y`
`<X->C`     | `N` |       | `N_Y` |
`<Y+>D`     |     |       | `N_Y` | `N_X_Y`
`<Y->E`     | `N` | `N_X` |       |
—           | `N` |       |       | `N_X_Y`
—           |     | `N_X` | `N_Y` |
`<X+, Y+>F` |     | `N_X` | `N_Y` | `N_X_Y`
`<X+, Y->G` | `N` | `N_X` |       | `N_X_Y`
`<X-, Y+>H` | `N` |       | `N_Y` | `N_X_Y`
`<X-, Y->I` | `N` | `N_X` | `N_Y` |
`<X+><Y+>J` |     |       |       | `N_X_Y`
`<X+><Y->K` |     | `N_X` |       |
`<X-><Y+>L` |     |       | `N_Y` |
`<X-><Y->M` | `N` |       |       |
`<X+><X->O` |     |       |       |

# Errors



## Syntax Errors (1xxx)
Syntax Errors arise when source text does not adhere to a language’s
formal lexical or syntactic grammar rules.
If this is the case, the code is said to be “ill-formed” (“not well-formed”).

There are two main types of syntax errors: lexical errors and parse errors.


### Lexical Errors (11xx)
When the source text fails to produce a token per the language’s lexical grammar rules,
a lexical error is raised.

1100. A general lexical error not covered by one of the following cases.
1101. The lexer reached a character that it does not recognize.
1102. The lexer reached the end of the file before it found the end of the current token.

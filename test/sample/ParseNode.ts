import type {
	Token,
} from '../../src/lexer/Token';
import {ParseNode} from '../../src/parser/ParseNode';



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

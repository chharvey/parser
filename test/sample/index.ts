import type {
	EBNFObject,
} from '../../src/types.d';



export const grammar: EBNFObject[] = require('./syntax.json');



export {
	TokenNumber,
	TokenCommentSample,
} from './Token';



export {
	ParseNodeUnit,
	ParseNodeGoal,
} from './ParseNode';



export {LexerSample} from './Lexer';



export {ParserSample} from './Parser';



export {
	TerminalNumber,
	TerminalOperator,
} from './Terminal';



export {
	ProductionUnit,
	ProductionGoal,
} from './Production'

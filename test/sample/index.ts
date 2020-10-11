import type {
	EBNFObject,
} from '../../src/types.d';



export const grammar: EBNFObject[] = require('./syntax.json');



export {
	TokenNumber,
	TokenCommentSample,
} from './Token';



export {LexerSample} from './Lexer';



export {
	TerminalNumber,
	TerminalOperator,
} from './Terminal';



export {
	ParseNodeUnit,
	ParseNodeGoal,
	ParserSample,
	ProductionUnit,
	ProductionGoal,
} from './Parser.auto'

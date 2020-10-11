import type {
	EBNFObject,
} from '../../src/types.d';



export const grammar: EBNFObject[] = require('./syntax.json');



export {
	MyTokenNumber,
	MyTokenComment,
} from './Token';



export {
	ParseNodeUnit,
	ParseNodeGoal,
} from './ParseNode';



export {MyLexer} from './Lexer';



export {MyParser} from './Parser';



export {
	TerminalNumber,
	TerminalOperator,
} from './Terminal';



export {
	ProductionUnit,
	ProductionGoal,
} from './Production'

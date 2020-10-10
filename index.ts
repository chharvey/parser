// Note: this file exists only for typescript declaration.
// It is not meant to be compiled automatically.
// See `./index.js` for the manual output.



export * as utils from './src/utils'
export {Filebound} from './src/Filebound'

export {Serializable} from './src/Serializable'
export {Char} from './src/scanner/Char'
export {
	Token,
	TokenFilebound,
	TokenWhitespace,
	TokenComment,
} from './src/lexer/Token'
export {ParseNode} from './src/parser/ParseNode'

export {Scanner} from './src/scanner/Scanner'
export {Lexer} from './src/lexer/Lexer'
export {Parser} from './src/parser/Parser'

export {Terminal} from './src/grammar/Terminal'
export {Production} from './src/grammar/Production'
export {Grammar} from './src/grammar/Grammar'

export {ErrorCode} from './src/error/ErrorCode'
export {
	LexError,
	LexError01,
	LexError02,
} from './src/error/LexError'
export {
	ParseError,
	ParseError01,
} from './src/error/ParseError'

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

export {Scanner} from './src/scanner/Scanner'
export {Lexer} from './src/lexer/Lexer'

export {ErrorCode} from './src/error/ErrorCode'
export {
	LexError,
	LexError01,
	LexError02,
} from './src/error/LexError'

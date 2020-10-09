const utils = require('./dist/utils.js')
const {Filebound} = require('./dist/Filebound.js')

const {Serializable} = require('./dist/Serializable.js')
const {Char} = require('./dist/scanner/Char.js')
const {
	Token,
	TokenFilebound,
	TokenWhitespace,
	TokenComment,
} = require('./dist/lexer/Token.js')

const {Scanner} = require('./dist/scanner/Scanner.js')
const {Lexer} = require('./dist/lexer/Lexer.js')

const {Terminal} = require('./dist/grammar/Terminal.js')
const {Production} = require('./dist/grammar/Production.js')
const {Grammar} = require('./dist/grammar/Grammar.js')

const {ErrorCode} = require('./dist/error/ErrorCode.js')
const {
	LexError,
	LexError01,
	LexError02,
} = require('./dist/error/LexError.js')



module.exports = {
	utils,
	Filebound,

	Serializable,
	Char,
	Token,
	TokenFilebound,
	TokenWhitespace,
	TokenComment,

	Scanner,
	Lexer,

	Terminal,
	Production,
	Grammar,

	ErrorCode,
	LexError,
	LexError01,
	LexError02,
}

const utils = require('./dist/utils.js')

const {Char} = require('./dist/scanner/Char.js')
const {
	Token,
	TokenFilebound,
	TokenWhitespace,
	TokenComment,
} = require('./dist/lexer/Token.js')
const {ParseNode} = require('./dist/parser/ParseNode.js')

const {Scanner} = require('./dist/scanner/Scanner.js')
const {Lexer} = require('./dist/lexer/Lexer.js')
const {Parser} = require('./dist/parser/Parser.js')

const {Terminal} = require('./dist/grammar/Terminal.js')
const {Production} = require('./dist/grammar/Production.js')
const {Grammar} = require('./dist/grammar/Grammar.js')

const {ErrorCode} = require('./dist/error/ErrorCode.js')
const {
	LexError,
	LexError01,
	LexError02,
} = require('./dist/error/LexError.js')
const {
	ParseError,
	ParseError01,
} = require('./dist/error/ParseError.js')



module.exports = {
	utils,
	Filebound: utils.Filebound,

	Char,
	Token,
	TokenFilebound,
	TokenWhitespace,
	TokenComment,
	ParseNode,

	Scanner,
	Lexer,
	Parser,

	Terminal,
	Production,
	Grammar,

	ErrorCode,
	LexError,
	LexError01,
	LexError02,
	ParseError,
	ParseError01,
}

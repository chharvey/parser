const fs   = require('fs');
const path = require('path');
const xjs  = require('extrajs');

const gulp       = require('gulp');
const mocha      = require('gulp-mocha');
const typescript = require('gulp-typescript');
// require('ts-node');    // DO NOT REMOVE … peerDependency of `gulp-mocha`
// require('typescript'); // DO NOT REMOVE … peerDependency of `gulp-typescript`



const tsconfig = require('./tsconfig.json');

function dist() {
	return gulp.src('./src/**/*.ts')
		.pipe(typescript(tsconfig.compilerOptions))
		.pipe(gulp.dest('./dist/'))
	;
}

async function pretest() {
	const {generate} = require('./dist/main.js');
	const grammar_ebnf   = fs.promises.readFile(path.join(__dirname, './src/ebnf/syntax.ebnf'),    'utf8');
	const grammar_sample = fs.promises.readFile(path.join(__dirname, './test/sample/syntax.ebnf'), 'utf8');
	function preamble(srcpath) {
		return xjs.String.dedent`
			/*----------------------------------------------------------------/
			| WARNING: Do not manually update this file!
			| It is auto-generated via
			| <${ srcpath }>.
			| If you need to make updates, make them there.
			/----------------------------------------------------------------*/
		`;
	}
	return Promise.all([
		fs.promises.writeFile(path.join(__dirname, './src/ebnf/Parser.auto.ts'), xjs.String.dedent`
			${ preamble('@chharvey/parser//src/main.ts') }
			${ generate(await grammar_ebnf).replace(xjs.String.dedent`
				import {
					NonemptyArray,
					Token,
					ParseNode,
					Parser,
					Production,
					Grammar,
					GrammarSymbol,
				} from '@chharvey/parser';
			`, xjs.String.dedent`
				import type {
					NonemptyArray,
				} from '../types.d';
				import type {Token} from '../lexer/Token';
				import {ParseNode} from '../parser/ParseNode';
				import {Parser} from '../parser/Parser';
				import {Production} from '../grammar/Production';
				import {
					Grammar,
					GrammarSymbol,
				} from '../grammar/Grammar';
			`) }
		`),
		fs.promises.writeFile(path.join(__dirname, './test/sample/Parser.auto.ts'), xjs.String.dedent`
			${ preamble('@chharvey/parser//src/main.ts') }
			${ generate(await grammar_sample).replace(xjs.String.dedent`
				import {
					NonemptyArray,
					Token,
					ParseNode,
					Parser,
					Production,
					Grammar,
					GrammarSymbol,
				} from '@chharvey/parser';
			`, xjs.String.dedent`
				import type {
					NonemptyArray,
				} from '../../src/types.d';
				import type {Token} from '../../src/lexer/Token';
				import {ParseNode} from '../../src/parser/ParseNode';
				import {Parser} from '../../src/parser/Parser';
				import {Production} from '../../src/grammar/Production';
				import {
					Grammar,
					GrammarSymbol,
				} from '../../src/grammar/Grammar';
			`) }
		`),
	]);
}

function test() {
	return gulp.src('./test/**/*.ts')
		.pipe(mocha({
			require: 'ts-node/register',
		}))
	;
}

const testall = gulp.series(pretest, test)

const build = gulp.series(dist, testall);



module.exports = {
	build,
		dist,
		testall,
			pretest,
			test,
};

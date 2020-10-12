const fs   = require('fs');
const path = require('path');

const gulp       = require('gulp');
const mocha      = require('gulp-mocha');
const typedoc    = require('gulp-typedoc');
const typescript = require('gulp-typescript');
// require('ts-node');    // DO NOT REMOVE … peerDependency of `gulp-mocha`
// require('typedoc');    // DO NOT REMOVE … peerDependency of `gulp-typedoc`
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
	const grammar = fs.promises.readFile(path.join(__dirname, './test/sample/syntax.ebnf'), 'utf8');
	function preamble(srcpath) {
		return `
			/*----------------------------------------------------------------/
			| WARNING: Do not manually update this file!
			| It is auto-generated via
			| <${ srcpath }>.
			| If you need to make updates, make them there.
			/----------------------------------------------------------------*/
		`;
	}
	return fs.promises.writeFile(path.join(__dirname, './test/sample/Parser.auto.ts'), `
		${ preamble('@chharvey/parser//src/main.ts') }
		${ generate(await grammar, 'Sample').replace(`
		import {
			NonemptyArray,
			Token,
			ParseNode,
			Parser,
			Production,
			Grammar,
			GrammarSymbol,
		} from '@chharvey/parser';
		`, `
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
	`);
}

function test() {
	return gulp.src('./test/**/*.ts')
		.pipe(mocha({
			require: 'ts-node/register',
		}))
	;
}

const testall = gulp.series(pretest, test)

function docs() {
	return gulp.src('./src/**/*.ts')
		.pipe(typedoc(tsconfig.typedocOptions))
	;
}

const build = gulp.parallel(
	gulp.series(dist, testall),
	docs,
);



module.exports = {
	build,
		dist,
		testall,
			pretest,
			test,
		docs,
};

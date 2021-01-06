import type {
	NonemptyArray,
} from '../types.d';
import {Token} from '../lexer/Token';
import type {ParseNode} from '../parser/ParseNode';
import type * as TOKEN from './Token';
import {
	Unop,
	Binop,
} from './ASTNode';
import * as ASTNODE from './ASTNode';
import * as PARSER from './Parser.auto';



export class Decorator {
	private static readonly OPS_UN: ReadonlyMap<string, Unop> = new Map<string, Unop>([
		[`+`, Unop.PLUS],
		[`*`, Unop.STAR],
		[`#`, Unop.HASH],
		[`?`, Unop.OPT],
	]);

	private static readonly OPS_BIN: ReadonlyMap<string, Binop> = new Map<string, Binop>([
		[`.`, Binop.ORDER],
		[`&`, Binop.CONCAT],
		[`|`, Binop.ALTERN],
	]);

	private static readonly PARAMOPS: ReadonlyMap<string, boolean | 'inherit'> = new Map<string, boolean | 'inherit'>([
		[`+`, true],
		[`-`, false],
		[`?`, 'inherit'],
	]);


	/**
	 * Return a JSON object describing an EBNF production.
	 * Similar to a node of the Semantic Tree or “decorated/abstract syntax tree”.
	 * @returns a JSON object containing the parse node’s semantics
	 */
	static decorate(node:
		| PARSER.ParseNodeParameterSet__0__List
		| PARSER.ParseNodeParameterSet
	): NonemptyArray<ASTNODE.ASTNodeParam>;
	static decorate(node:
		| PARSER.ParseNodeArgumentSet__0__List
		| PARSER.ParseNodeArgumentSet
	): NonemptyArray<ASTNODE.ASTNodeArg>;
	static decorate(node:
		| PARSER.ParseNodeConditionSet__0__List
		| PARSER.ParseNodeConditionSet
	): NonemptyArray<ASTNODE.ASTNodeCondition>;
	static decorate(node: PARSER.ParseNodeReference): ASTNODE.ASTNodeRef;
	static decorate(node:
		| PARSER.ParseNodeUnit
		| PARSER.ParseNodeUnary
		| PARSER.ParseNodeItem
		| PARSER.ParseNodeOrder
		| PARSER.ParseNodeConcat
		| PARSER.ParseNodeAltern
		| PARSER.ParseNodeDefinition
	): ASTNODE.ASTNodeExpr;
	static decorate(node: PARSER.ParseNodeNonterminalName): ASTNODE.ASTNodeNonterminal;
	static decorate(node: PARSER.ParseNodeProduction):      ASTNODE.ASTNodeProduction;
	static decorate(node: PARSER.ParseNodeGoal__0__List):   NonemptyArray<ASTNODE.ASTNodeProduction>;
	static decorate(node: PARSER.ParseNodeGoal):            ASTNODE.ASTNodeGoal;
	static decorate(node: ParseNode): ASTNODE.ASTNodeEBNF | readonly ASTNODE.ASTNodeEBNF[];
	static decorate(node: ParseNode): ASTNODE.ASTNodeEBNF | readonly ASTNODE.ASTNodeEBNF[] {
		if (node instanceof PARSER.ParseNodeParameterSet__0__List) {
			function decorateParam(identifier: TOKEN.TokenIdentifier): ASTNODE.ASTNodeParam {
				return new ASTNODE.ASTNodeParam(identifier);
			}
			return (node.children.length === 1)
				? [
					decorateParam(node.children[0] as TOKEN.TokenIdentifier),
				]
				: [
					...this.decorate(node.children[0]),
					decorateParam(node.children[2] as TOKEN.TokenIdentifier),
				]
			;

		} else if (node instanceof PARSER.ParseNodeParameterSet) {
			return this.decorate(node.children[1]);

		} else if (node instanceof PARSER.ParseNodeArgumentSet__0__List) {
			function decorateArg(identifier: TOKEN.TokenIdentifier, append: TOKEN.TokenPunctuator): ASTNODE.ASTNodeArg {
				return new ASTNODE.ASTNodeArg(identifier, Decorator.PARAMOPS.get(append.source)!);
			}
			return (node.children.length === 2)
				? [
					decorateArg(
						node.children[1] as TOKEN.TokenIdentifier,
						node.children[0] as TOKEN.TokenPunctuator,
					),
				]
				: [
					...this.decorate(node.children[0]),
					decorateArg(
						node.children[3] as TOKEN.TokenIdentifier,
						node.children[2] as TOKEN.TokenPunctuator,
					),
				]
			;

		} else if (node instanceof PARSER.ParseNodeArgumentSet) {
			return this.decorate(node.children[1]);

		} else if (node instanceof PARSER.ParseNodeConditionSet__0__List) {
			function decorateCondition(identifier: TOKEN.TokenIdentifier, include: TOKEN.TokenPunctuator): ASTNODE.ASTNodeCondition {
				return new ASTNODE.ASTNodeCondition(identifier, Decorator.PARAMOPS.get(include.source) as boolean);
			}
			return (node.children.length === 2)
				? [
					decorateCondition(
						node.children[0] as TOKEN.TokenIdentifier,
						node.children[1] as TOKEN.TokenPunctuator,
					),
				]
				: [
					...this.decorate(node.children[0]),
					decorateCondition(
						node.children[2] as TOKEN.TokenIdentifier,
						node.children[3] as TOKEN.TokenPunctuator,
					),
				]
			;

		} else if (node instanceof PARSER.ParseNodeConditionSet) {
			return this.decorate(node.children[1]);

		} else if (node instanceof PARSER.ParseNodeReference) {
			return (node.children.length === 1)
				? new ASTNODE.ASTNodeRef(
					node,
					node.children[0] as TOKEN.TokenIdentifier,
				)
				: new ASTNODE.ASTNodeRef(
					node,
					this.decorate(node.children[0]),
					this.decorate(node.children[1]),
				)
			;

		} else if (node instanceof PARSER.ParseNodeUnit) {
			return (node.children.length === 1)
				? (node.children[0] instanceof Token)
					? new ASTNODE.ASTNodeConst(node.children[0] as TOKEN.TokenCharCode | TOKEN.TokenString | TOKEN.TokenCharClass)
					: this.decorate(node.children[0])
				: this.decorate(node.children[1])
			;

		} else if (node instanceof PARSER.ParseNodeUnary) {
			let operand: ASTNODE.ASTNodeExpr = this.decorate(node.children[0]);
			if (node.children.length === 1) {
				return operand;
			};
			operand = new ASTNODE.ASTNodeOpUn(
				node,
				this.OPS_UN.get(node.children[1].source)!,
				operand,
			);
			if (node.children.length === 2) {
				return operand;
			};
			operand = new ASTNODE.ASTNodeOpUn(
				node,
				Unop.OPT,
				operand,
			);
			return operand;

		} else if (node instanceof PARSER.ParseNodeItem) {
			return (node.children.length === 1)
				? this.decorate(node.children[0])
				: new ASTNODE.ASTNodeItem(
					node,
					this.decorate(node.children[1]),
					this.decorate(node.children[0]) as unknown as NonemptyArray<ASTNODE.ASTNodeCondition>,
				)
			;

		} else if (node instanceof PARSER.ParseNodeOrder) {
			return (node.children.length === 1)
				? this.decorate(node.children[0])
				: new ASTNODE.ASTNodeOpBin(
					node,
					Binop.ORDER,
					this.decorate(node.children[0]),
					this.decorate((node.children.length === 2) ? node.children[1] : node.children[2]),
				)
			;

		} else if (
			node instanceof PARSER.ParseNodeConcat ||
			node instanceof PARSER.ParseNodeAltern
		) {
			return (node.children.length === 1)
				? this.decorate(node.children[0])
				: new ASTNODE.ASTNodeOpBin(
					node,
					this.OPS_BIN.get(node.children[1].source)!,
					this.decorate(node.children[0]),
					this.decorate(node.children[2]),
				)
			;

		} else if (node instanceof PARSER.ParseNodeDefinition) {
			return this.decorate((node.children[0] instanceof PARSER.ParseNodeAltern)
				? node.children[0]
				: node.children[1] as PARSER.ParseNodeAltern
			);

		} else if (node instanceof PARSER.ParseNodeNonterminalName) {
			return (node.children.length === 1)
				? new ASTNODE.ASTNodeNonterminal(
					node,
					node.children[0] as TOKEN.TokenIdentifier,
				)
				: new ASTNODE.ASTNodeNonterminal(
					node,
					this.decorate(node.children[0]),
					this.decorate(node.children[1]),
				)
			;

		} else if (node instanceof PARSER.ParseNodeProduction) {
			return new ASTNODE.ASTNodeProduction(
				node,
				this.decorate(node.children[0]),
				this.decorate(node.children[2]),
			);

		} else if (node instanceof PARSER.ParseNodeGoal__0__List) {
			return (node.children.length === 1)
				? [
					this.decorate(node.children[0]),
				]
				: [
					...this.decorate(node.children[0]),
					this.decorate(node.children[1]),
				]
			;

		} else if (node instanceof PARSER.ParseNodeGoal) {
			return new ASTNODE.ASTNodeGoal(node, (node.children.length === 2) ? [] : this.decorate(node.children[1]));

		} else {
			throw new ReferenceError(`Could not find type of parse node ${ node }.`);
		};
	}
}

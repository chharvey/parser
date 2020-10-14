import type {
	NonemptyArray,
	EBNFObject,
	EBNFChoice,
	EBNFSequence,
	EBNFItem,
} from '../types.d';
import * as utils from '../utils';
import type {Token} from '../lexer/Token';
import type {ParseNode} from '../parser/ParseNode';
import {ASTNode} from '../validator/ASTNode';
import * as TOKEN from './Token';



const PARAM_SEPARATOR: string = '_';
const SUB_SEPARATOR:   string = '__';



export enum Unop {
	PLUS,
	STAR,
	HASH,
	OPT,
}



export enum Binop {
	ORDER,
	CONCAT,
	ALTERN,
}



export class ASTNodeEBNF extends ASTNode {
	constructor (
		parse_node: ParseNode | Token,
		attributes: {[key: string]: boolean | number | string} = {},
		children:   readonly ASTNode[] = [],
	) {
		super(parse_node, attributes, children);
	}
}



export class ASTNodeParam extends ASTNodeEBNF {
	declare readonly children: readonly [];
	constructor (parse_node: TOKEN.TokenIdentifier) {
		super(parse_node, {name: parse_node.source});
	}
}



export class ASTNodeArg extends ASTNodeEBNF {
	declare readonly children: readonly [];
	constructor (
		parse_node: TOKEN.TokenIdentifier,
		readonly append: boolean | 'inherit',
	) {
		super(parse_node, {name: parse_node.source, append});
	}
}



export class ASTNodeCondition extends ASTNodeEBNF {
	declare readonly children: readonly [];
	constructor (
		parse_node: TOKEN.TokenIdentifier,
		readonly include: boolean,
	) {
		super(parse_node, {name: parse_node.source, include});
	}
}



export abstract class ASTNodeExpr extends ASTNodeEBNF {
	/**
	 * Transform this semantic expression into JSON data.
	 * @param   nt   a specific nonterminal symbol that contains this expression
	 * @param   data the bank of JSON data
	 * @returns      data representing an EBNF choice
	 */
	abstract transform(nt: ConcreteNonterminal, data: EBNFObject[]): EBNFChoice;
}



export class ASTNodeConst extends ASTNodeExpr {
	declare readonly children: readonly [];
	constructor (
		private readonly p_node:
			| TOKEN.TokenCharCode
			| TOKEN.TokenString
			| TOKEN.TokenCharClass
		,
	) {
		super(p_node, {value: p_node.source});
	}

	/** @implements ASTNodeExpr */
	transform(_nt: ConcreteNonterminal, _data: EBNFObject[]): EBNFChoice {
		return [
			[
				(this.p_node instanceof TOKEN.TokenCharCode) ? `'\\u${ this.source.slice(2).padStart(4, '0') }'` :
				(this.p_node instanceof TOKEN.TokenCharClass) ? `'${ this.source }'` :
				`'${ this.source.slice(1, -1) }'` // replace double-quotes with single-quotes
			],
		];
	}
}



export class ASTNodeRef extends ASTNodeExpr {
	declare readonly children: readonly ASTNodeArg[];
	private readonly name: string;
	constructor (parse_node: ParseNode, ref: TOKEN.TokenIdentifier);
	constructor (parse_node: ParseNode, ref: ASTNodeRef, args: readonly ASTNodeArg[]);
	constructor (
		parse_node: ParseNode,
		private readonly ref:  TOKEN.TokenIdentifier | ASTNodeRef,
		private readonly args: readonly ASTNodeArg[] = [],
	) {
		super(
			parse_node,
			{name: (ref instanceof ASTNodeRef) ? ref.name : ref.source},
			(ref instanceof ASTNodeRef) ? [ref, ...args] : [],
		);
		this.name = (ref instanceof ASTNodeRef) ? ref.name : ref.source;
	}

	/** @implements ASTNodeExpr */
	transform(nt: ConcreteNonterminal, _data: EBNFObject[]): EBNFChoice {
		return (this.name === this.name.toUpperCase())
			/* ALLCAPS: terminal identifier */
			? [[{term: this.name}]]
			/* TitleCase: production identifier */
			: [[{
				prod: `${ this.name }${ (this.ref instanceof ASTNodeRef)
					/* with arguments */
					? this.args.map((arg) =>
						(arg.append === true || arg.append === 'inherit' && nt.hasSuffix(arg))
							? `${ PARAM_SEPARATOR }${ arg.source }`
							: ''
					).join('')
					/* no arguments */
					: ''
				}`
			}]]
		;
	}
}



export class ASTNodeItem extends ASTNodeExpr {
	declare readonly children: readonly ASTNodeCondition[];
	constructor (
		parse_node: ParseNode,
		private readonly item:       ASTNodeExpr,
		private readonly conditions: readonly ASTNodeCondition[] = [],
	) {
		super(parse_node, {}, [item, ...conditions]);
	}

	/** @implements ASTNodeExpr */
	transform(nt: ConcreteNonterminal, data: EBNFObject[]): EBNFChoice {
		return (this.conditions.some((cond) => cond.include === nt.hasSuffix(cond)))
			? this.item.transform(nt, data)
			: [
				['\'\''],
			]
		;
	}
}


abstract class ASTNodeOp extends ASTNodeExpr {
	constructor (parse_node: ParseNode, operator: number, operands: NonemptyArray<ASTNodeExpr>) {
		super(parse_node, {operator}, operands);
	}
}


export class ASTNodeOpUn extends ASTNodeOp {
	declare readonly children: readonly [ASTNodeExpr];
	constructor (
		parse_node: ParseNode,
		private readonly operator: Unop,
		private readonly operand:  ASTNodeExpr,
	) {
		super(parse_node, operator, [operand]);
	}

	/** @implements ASTNodeExpr */
	transform(nt: ConcreteNonterminal, data: EBNFObject[]): EBNFChoice {
		const name: string = `${ nt }${ SUB_SEPARATOR }${ nt.subCount }${ SUB_SEPARATOR }List`;
		const trans: EBNFChoice = this.operand.transform(nt, data);
		return new Map<Unop, () => EBNFChoice>([
			[Unop.PLUS, () => {
				data.push({
					name,
					defn: utils.NonemptyArray_flatMap(trans, (seq) => [
						seq,
						[{prod: name}, ...seq],
					]),
				});
				return [
					[{prod: name}],
				];
			}],
			[Unop.STAR, () => {
				data.push({
					name,
					defn: utils.NonemptyArray_flatMap(trans, (seq) => [
						seq,
						[{prod: name}, ...seq],
					]),
				});
				return [
					['\'\''],
					[{prod: name}],
				];
			}],
			[Unop.HASH, () => {
				data.push({
					name,
					defn: utils.NonemptyArray_flatMap(trans, (seq) => [
						seq,
						[{prod: name}, '\',\'', ...seq],
					]),
				});
				return [
					[{prod: name}],
				];
			}],
			[Unop.OPT, () => {
				return [
					['\'\''],
					...trans,
				];
			}],
		]).get(this.operator)!();
	}
}


export class ASTNodeOpBin extends ASTNodeOp {
	declare readonly children: readonly [ASTNodeExpr, ASTNodeExpr];
	constructor (
		parse_node: ParseNode,
		private readonly operator: Binop,
		private readonly operand0: ASTNodeExpr,
		private readonly operand1: ASTNodeExpr,
	) {
		super(parse_node, operator, [operand0, operand1]);
	}

	/** @implements ASTNodeExpr */
	transform(nt: ConcreteNonterminal, data: EBNFObject[]): EBNFChoice {
		const trans0: EBNFChoice = this.operand0.transform(nt, data);
		const trans1: EBNFChoice = this.operand1.transform(nt, data);
		return new Map<Binop, () => EBNFChoice>([
			[Binop.ORDER, () => utils.NonemptyArray_flatMap(trans0, (seq0) =>
				utils.NonemptyArray_flatMap(trans1, (seq1) => [
					[...seq0, ...seq1],
				])
			)],
			[Binop.CONCAT, () => utils.NonemptyArray_flatMap(trans0, (seq0) =>
				utils.NonemptyArray_flatMap(trans1, (seq1) => [
					[...seq0, ...seq1],
					[...seq1, ...seq0],
				])
			)],
			[Binop.ALTERN, () => [
				...trans0,
				...trans1,
			]],
		]).get(this.operator)!();
	}
}


export class ASTNodeNonterminal extends ASTNodeEBNF {
	declare readonly children: readonly ASTNodeParam[];
	private readonly name: string;
	constructor (parse_node: ParseNode, nonterm: TOKEN.TokenIdentifier);
	constructor (parse_node: ParseNode, nonterm: ASTNodeNonterminal, params: readonly ASTNodeParam[]);
	constructor (
		parse_node: ParseNode,
		nonterm: TOKEN.TokenIdentifier | ASTNodeNonterminal,
		private readonly params: readonly ASTNodeParam[] = [],
	) {
		super(
			parse_node,
			{name: (nonterm instanceof ASTNodeNonterminal) ? nonterm.name : nonterm.source},
			(nonterm instanceof ASTNodeNonterminal) ? [nonterm, ...params] : [],
		);
		this.name = (nonterm instanceof ASTNodeNonterminal) ? nonterm.name : nonterm.source;
	}

	/**
	 * Expands this nonterminal in its abstract form into a set of nonterminals with concrete parameters.
	 * E.g., expands `N<X, Y>` into `[N, N_X, N_Y, N_X_Y]`.
	 * @returns an array of objects representing nonterminals
	 */
	expand(): ConcreteNonterminal[] {
		return [...new Array(2 ** this.params.length)].map((_, count) => new ConcreteNonterminal(
			this.name,
			[...count.toString(2).padStart(this.params.length, '0')].map((d, i) =>
				[this.params[i], !!+d] as const
			).filter(([_param, b]) => !!b).map(([param, _b]) => param),
		));
	}
}


export class ASTNodeProduction extends ASTNodeEBNF {
	declare readonly children: readonly [ASTNodeNonterminal, ASTNodeExpr];
	constructor (
		parse_node: ParseNode,
		private readonly nonterminal: ASTNodeNonterminal,
		private readonly definition:  ASTNodeExpr,
	) {
		super(parse_node, {}, [nonterminal, definition]);
	}

	transform(): EBNFObject[] {
		const productions_data: EBNFObject[] = [];
		productions_data.push(...this.nonterminal.expand().map((n) => ({
			name: n.toString(),
			defn: this.definition.transform(n, productions_data),
		})));
		return productions_data;
	}
}


export class ASTNodeGoal extends ASTNodeEBNF {
	declare readonly children: readonly ASTNodeProduction[];
	constructor (
		parse_node: ParseNode,
		private readonly productions: readonly ASTNodeProduction[] = [],
	) {
		super(parse_node, {}, productions);
	}

	transform(): EBNFObject[] {
		return this.productions.flatMap((prod) => prod.transform()).map((prod) => ({
			name: prod.name,
			defn: prod.defn.map((seq) => seq.filter((item) => item !== '\'\'') as readonly EBNFItem[] as EBNFSequence) as readonly EBNFSequence[] as EBNFChoice,
		}));
	}
}



class ConcreteNonterminal {
	/** A counter for internal sub-expressions. Used for naming automated productions. */
	private sub_count: bigint = 0n;

	constructor (
		readonly name: string,
		private readonly suffixes: ASTNodeParam[],
	) {
	}

	/**
	 * Return the sub-expression count, and then increment it.
	 * @return this ConcreteNonterminal’s current sub-expression counter
	 */
	get subCount(): bigint {
		return this.sub_count++;
	}

	/** @override */
	toString(): string {
		return `${ this.name }${ this.suffixes.map((s) => `${ PARAM_SEPARATOR }${ s.source }`).join('') }`;
	}

	hasSuffix(p: ASTNodeParam | ASTNodeArg | ASTNodeCondition): boolean {
		return !!this.suffixes.find((suffix) => suffix.source === p.source);
	}
}

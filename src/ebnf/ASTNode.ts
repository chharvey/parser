import deepStrictEqual from 'fast-deep-equal';

import type {
	Mutable,
	NonemptyArray,
	EBNFObject,
	EBNFChoice,
	EBNFSequence,
	EBNFItem,
} from '../types.d';
import {MapEq} from '../MapEq';
import * as utils from '../utils';
import type {Token} from '../lexer/Token';
import type {ParseNode} from '../parser/ParseNode';
import {ASTNode} from '../validator/ASTNode';
import * as TOKEN from './Token';



const PARAM_SEPARATOR: string = '_';
const SUB_SEPARATOR:   string = '__';
const FAMILY_SYMBOL:   string = '$';



export enum Unop {
	PLUS,
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
				(this.p_node instanceof TOKEN.TokenCharCode) ? `\\u${ this.source.slice(2).padStart(4, '0') }` : // remove '#x'
				(this.p_node instanceof TOKEN.TokenCharClass) ? `'${ this.source }'` :
				this.source.slice(1, -1) // remove double-quotes
			],
		];
	}
}



export class ASTNodeRef extends ASTNodeExpr {
	declare readonly children: readonly ASTNodeArg[];
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
	}
	private readonly name: string = (this.ref instanceof ASTNodeRef) ? this.ref.name : this.ref.source;

	/** @implements ASTNodeExpr */
	transform(nt: ConcreteNonterminal, _data: EBNFObject[]): EBNFChoice {
		return (this.name === this.name.toUpperCase())
			/* ALLCAPS: terminal identifier */
			? [
				[{term: this.name}],
			]
			/* TitleCase: production identifier */
			: utils.NonemptyArray_flatMap(this.expand(nt), (cr) => [
				[{prod: cr.toString()}],
			])
		;
	}

	/**
	 * Expands this reference in its abstract form into a set of references with concrete arguments.
	 * E.g., expands `R<+X, +Y>` into `[R_X, R_Y, R_X_Y]`.
	 * @param   nt a specific nonterminal symbol that contains this expression
	 * @returns    an array of objects representing references
	 */
	private expand(nt: ConcreteNonterminal): NonemptyArray<ConcreteReference> {
		return (this.args.length)
			? utils.NonemptyArray_flatMap((this.ref as ASTNodeRef).expand(nt), (cr) =>
				[...new Array(2 ** this.args.length)].map((_, count) =>
					new ConcreteReference(cr.name, [
						...cr.suffixes,
						...[...count.toString(2).padStart(this.args.length, '0')]
							.map((d, i) => [this.args[i], !!+d] as const)
							.filter(([_arg, b]) => !!b)
							.map(([arg, _b]) => arg)
						,
					], nt)
				).slice(1) as NonemptyArray<ConcreteReference> // slice off the \b00 case because `R<+X, +Y>` should never give `R`.
			)
			: [new ConcreteReference(this.name)]
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
				[''],
			]
		;
	}
}


abstract class ASTNodeOp extends ASTNodeExpr {
	constructor (parse_node: ParseNode, operator: number, operands: Readonly<NonemptyArray<ASTNodeExpr>>) {
		super(parse_node, {operator}, operands);
	}
}


export class ASTNodeOpUn extends ASTNodeOp {
	private static readonly memoized: ReadonlyMap<Unop, MapEq<EBNFChoice, string>> = new Map<Unop, MapEq<EBNFChoice, string>>([
		[Unop.PLUS, new MapEq<EBNFChoice, string>(deepStrictEqual)],
		[Unop.HASH, new MapEq<EBNFChoice, string>(deepStrictEqual)],
	]);
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
		return new Map<Unop, (operand: EBNFChoice) => EBNFChoice>([
			[Unop.PLUS, (operand) => {
				const memoized: MapEq<EBNFChoice, string> = ASTNodeOpUn.memoized.get(Unop.PLUS)!;
				if (!memoized.has(operand)) {
					const name: string = nt.newSubexprName;
					memoized.set(operand, name);
					data.push({
						name,
						defn: utils.NonemptyArray_flatMap(operand, (seq) => [
							seq,
							[{prod: name}, ...seq],
						]),
					});
				};
				return [
					[{prod: memoized.get(operand)!}],
				];
			}],
			[Unop.HASH, (operand) => {
				const memoized: MapEq<EBNFChoice, string> = ASTNodeOpUn.memoized.get(Unop.HASH)!;
				if (!memoized.has(operand)) {
					const name: string = nt.newSubexprName;
					memoized.set(operand, name);
					data.push({
						name,
						defn: utils.NonemptyArray_flatMap(operand, (seq) => [
							seq,
							[{prod: name}, ',', ...seq],
						]),
					});
				};
				return [
					[{prod: memoized.get(operand)!}],
				];
			}],
			[Unop.OPT, (operand) => {
				return [
					[''],
					...operand,
				];
			}],
		]).get(this.operator)!(this.operand.transform(nt, data));
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
	constructor (parse_node: ParseNode, nonterm: TOKEN.TokenIdentifier);
	constructor (parse_node: ParseNode, nonterm: ASTNodeNonterminal, params: readonly ASTNodeParam[]);
	constructor (
		parse_node: ParseNode,
		private readonly nonterm: TOKEN.TokenIdentifier | ASTNodeNonterminal,
		private readonly params:  readonly ASTNodeParam[] = [],
	) {
		super(
			parse_node,
			{name: (nonterm instanceof ASTNodeNonterminal) ? nonterm.name : nonterm.source},
			(nonterm instanceof ASTNodeNonterminal) ? [nonterm, ...params] : [],
		);
	}
	private readonly name: string = (this.nonterm instanceof ASTNodeNonterminal) ? this.nonterm.name : this.nonterm.source;

	/**
	 * Expands this nonterminal in its abstract form into a set of nonterminals with concrete parameters.
	 * E.g., expands `N<X, Y>` into `[N, N_X, N_Y, N_X_Y]`.
	 * @returns an array of objects representing nonterminals
	 */
	expand(): ConcreteNonterminal[] {
		return (this.params.length)
			? (this.nonterm as ASTNodeNonterminal).expand().flatMap((cn) =>
				[...new Array(2 ** this.params.length)].map((_, count) =>
					new ConcreteNonterminal(cn.name, [
						...cn.suffixes,
						...[...count.toString(2).padStart(this.params.length, '0')]
							.map((d, i) => [this.params[i], !!+d] as const)
							.filter(([_param, b]) => !!b)
							.map(([param, _b]) => param)
						,
					])
				)
			)
			: [new ConcreteNonterminal(this.name)]
		;
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
		const nonterms: ConcreteNonterminal[] = this.nonterminal.expand();
		const data: Mutable<EBNFObject>[] = nonterms.map((cn) => ({
			name: cn.toString(),
			defn: this.definition.transform(cn, productions_data),
		}));
		if (nonterms.length >= 2) {
			const family_name: string = `${ nonterms[0].name }${ FAMILY_SYMBOL }`;
			productions_data.push({
				name: family_name,
				family: true,
				defn: data.flatMap((json) => json.defn) as readonly EBNFSequence[] as EBNFChoice,
			});
			data.forEach((json) => {
				json.family = family_name;
			});
		};
		productions_data.push(...data);
		productions_data.forEach((json) => {
			(json as Mutable<EBNFObject>).defn = json.defn
				.map((seq) => seq.filter((item) => item !== '') as readonly EBNFItem[] as EBNFSequence)
				.filter((seq) => seq.length) as readonly EBNFSequence[] as EBNFChoice
			;
		});
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
		return this.productions.flatMap((prod) => prod.transform());
	}
}



class ConcreteReference {
	constructor (
		readonly name: string,
		readonly suffixes: ASTNodeArg[] = [],
		readonly nonterminal?: ConcreteNonterminal,
	) {
	}

	/** @override */
	toString(): string {
		return `${ this.name }${ this.suffixes.map((s) => s.append === true || s.append === 'inherit' && this.nonterminal?.hasSuffix(s)
			? `${ PARAM_SEPARATOR }${ s.source }`
			: ''
		).join('') }`;
	}
}



class ConcreteNonterminal {
	/** A counter for internal sub-expressions. Used for naming automated productions. */
	private sub_count: bigint = 0n;

	constructor (
		readonly name: string,
		readonly suffixes: ASTNodeParam[] = [],
	) {
	}

	/**
	 * Generate a new name for a sublist of this ConcreteNonterminal,
	 * incrementing its sub-expression counter each time.
	 * @return a new name for a list containing this ConcreteNonterminal’s current sub-expression counter
	 */
	get newSubexprName(): string {
		return `${ this }${ SUB_SEPARATOR }${ this.sub_count++ }${ SUB_SEPARATOR }List`;
	}

	/** @override */
	toString(): string {
		return `${ this.name }${ this.suffixes.map((s) => `${ PARAM_SEPARATOR }${ s.source }`).join('') }`;
	}

	hasSuffix(p: ASTNodeParam | ASTNodeArg | ASTNodeCondition): boolean {
		return !!this.suffixes.find((suffix) => suffix.source === p.source);
	}
}

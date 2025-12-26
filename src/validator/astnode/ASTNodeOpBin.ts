import type {
	NonemptyArray,
	EBNFObject,
	EBNFChoice,
	EBNFSequence,
} from '../../types.d';
import type * as PARSENODE from '../../parser/parsenode/index';
import {
	Op,
	Binop,
} from '../Operator';
import type {ConcreteNonterminal} from './utils-private';
import type {ASTNodeExpr} from './ASTNodeExpr';
import {ASTNodeOp} from './ASTNodeOp';



export class ASTNodeOpBin extends ASTNodeOp {
	constructor (
		parse_node: PARSENODE.ParseNodeSeq | PARSENODE.ParseNodeUnSeq | PARSENODE.ParseNodeUnChoice | PARSENODE.ParseNodeChoice,
		readonly operator: Binop,
		readonly operand0: ASTNodeExpr,
		readonly operand1: ASTNodeExpr,
	) {
		super(parse_node, operator, [operand0, operand1]);
	}

	override transform(nt: ConcreteNonterminal, has_params: boolean, data: EBNFObject[]): EBNFChoice {
		const trans0: EBNFChoice = this.operand0.transform(nt, has_params, data);
		const trans1: EBNFChoice = this.operand1.transform(nt, has_params, data);
		return new Map<Binop, () => EBNFChoice>([
			[Op.SEQ, () => trans0.flatMap((seq0) =>
				trans1.flatMap((seq1) => [
					[...seq0, ...seq1],
				] as const)
			) as NonemptyArray<EBNFSequence>],
			[Op.UNSEQ, () => trans0.flatMap((seq0) =>
				trans1.flatMap((seq1) => [
					[...seq0, ...seq1],
					[...seq1, ...seq0],
				] as const)
			) as NonemptyArray<EBNFSequence>],
			[Op.UNCHOICE, () => [
				...trans0,
				...trans1,
				...trans0.flatMap((seq0) =>
					trans1.flatMap((seq1) => [
						[...seq0, ...seq1],
						[...seq1, ...seq0],
					] as const)
				) as NonemptyArray<EBNFSequence>,
			]],
			[Op.CHOICE, () => [
				...trans0,
				...trans1,
			]],
		]).get(this.operator)!();
	}
}

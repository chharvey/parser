import type {
	NonemptyArray,
} from '../../types.d';
import type {Serializable} from '../../Serializable';
import {ASTNodeExpr} from './ASTNodeExpr';



/**
 * Known subclasses:
 * - ASTNodeOpUn
 * - ASTNodeOpBin
 */
export abstract class ASTNodeOp extends ASTNodeExpr {
	constructor (parse_node: Serializable, operator: number, operands: Readonly<NonemptyArray<ASTNodeExpr>>) {
		super(parse_node, {operator}, operands);
	}
}

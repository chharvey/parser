import type {Serializable} from '../../Serializable';
import {ASTNode} from '../ASTNode';



/**
 * Known subclasses:
 * - ASTNodeParam
 * - ASTNodeArg
 * - ASTNodeCondition
 * - ASTNodeExpr
 * - ASTNodeNonterminal
 * - ASTNodeProduction
 * - ASTNodeGoal
 */
export class ASTNodeEbnf extends ASTNode {
	constructor (
		parse_node: Serializable,
		attributes: {[key: string]: boolean | number | string} = {},
		children:   readonly ASTNode[] = [],
	) {
		super(parse_node, attributes, children);
	}
}

import type * as TOKEN from '../../lexer/token/index';
import {ASTNodeEbnf} from './ASTNodeEbnf';



export class ASTNodeCondition extends ASTNodeEbnf {
	constructor (
		parse_node: TOKEN.TokenIdentifier,
		readonly include: boolean,
	) {
		super(parse_node, {name: parse_node.source, include});
	}
}

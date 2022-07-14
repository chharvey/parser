import type * as TOKEN from '../../lexer/token/index';
import {ASTNodeEbnf} from './ASTNodeEbnf';



export class ASTNodeParam extends ASTNodeEbnf {
	constructor (parse_node: TOKEN.TokenIdentifier) {
		super(parse_node, {name: parse_node.source});
	}
}

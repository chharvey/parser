import type * as TOKEN from '../../lexer/token/index';
import {ASTNodeEbnf} from './ASTNodeEbnf';



export class ASTNodeArg extends ASTNodeEbnf {
	constructor (
		parse_node: TOKEN.TokenIdentifier,
		readonly append: boolean | 'inherit' | 'notinherit',
	) {
		super(parse_node, {name: parse_node.source, append});
	}
}

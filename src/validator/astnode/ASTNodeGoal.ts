import type {
	EBNFObject,
} from '../../types.d';
import type * as PARSENODE from '../../ebnf/Parser.auto';
import {ASTNodeEbnf} from './ASTNodeEbnf';
import type {ASTNodeProduction} from './ASTNodeProduction';



export class ASTNodeGoal extends ASTNodeEbnf {
	constructor (
		parse_node: PARSENODE.ParseNodeGoal,
		readonly productions: readonly ASTNodeProduction[] = [],
	) {
		super(parse_node, {}, productions);
	}

	transform(): EBNFObject[] {
		return this.productions.flatMap((prod) => prod.transform());
	}
}

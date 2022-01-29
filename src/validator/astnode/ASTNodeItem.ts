import type {
	EBNFObject,
	EBNFChoice,
} from '../../types.d';
import type * as PARSENODE from '../../parser/parsenode/index';
import type {
	ConcreteNonterminal,
} from './utils-private';
import type {ASTNodeCondition} from './ASTNodeCondition';
import {ASTNodeExpr} from './ASTNodeExpr';



export class ASTNodeItem extends ASTNodeExpr {
	constructor (
		parse_node: PARSENODE.ParseNodeItem,
		private readonly item:       ASTNodeExpr,
		private readonly conditions: readonly ASTNodeCondition[] = [],
	) {
		super(parse_node, {}, [item, ...conditions]);
	}

	override transform(nt: ConcreteNonterminal, has_params: boolean, data: EBNFObject[]): EBNFChoice {
		return (this.conditions.some((cond) => cond.include === nt.hasSuffix(cond)))
			? this.item.transform(nt, has_params, data)
			: [
				[''],
			]
		;
	}
}

import type {
	EBNFObject,
	EBNFChoice,
	EBNFSequence,
	EBNFItem,
} from '../../types.d';
import type * as PARSENODE from '../../ebnf/Parser.auto';
import {
	Mutable,
	FAMILY_SYMBOL,
	ConcreteNonterminal,
} from './utils-private';
import {ASTNodeEbnf} from './ASTNodeEbnf';
import type {ASTNodeExpr} from './ASTNodeExpr';
import type {ASTNodeNonterminal} from './ASTNodeNonterminal';



export class ASTNodeProduction extends ASTNodeEbnf {
	constructor (
		parse_node: PARSENODE.ParseNodeProduction,
		readonly nonterminal: ASTNodeNonterminal,
		readonly definition:  ASTNodeExpr,
	) {
		super(parse_node, {}, [nonterminal, definition]);
	}

	transform(): EBNFObject[] {
		const productions_data: EBNFObject[] = [];
		const nonterms: ConcreteNonterminal[] = this.nonterminal.expand();
		const data: Mutable<EBNFObject>[] = nonterms.map((cn) => ({
			name: cn.toString(),
			defn: this.definition.transform(cn, this.nonterminal.params.length > 0, productions_data),
		}));
		if (nonterms.length >= 2) {
			const family_name: string = nonterms[0].name.concat(FAMILY_SYMBOL);
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

export type NonemptyArray<T> = readonly [T, ...readonly T[]]



export type EBNFObject = {
	readonly name: string,
	readonly defn: EBNFChoice,
}

type EBNFChoice = NonemptyArray<EBNFSequence>

type EBNFSequence = NonemptyArray<EBNFItem>

type EBNFItem =
	| string
	| { readonly term: string }
	| { readonly prod: string }

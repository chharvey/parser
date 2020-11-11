export type Mutable<T> = {
	-readonly [P in keyof T]: T[P];
};



export type NonemptyArray<T> = readonly [T, ...readonly T[]];



export type EBNFObject = {
	/** The name of the production. */
	readonly name: string,
	/** The production definition. */
	readonly defn: EBNFChoice,
	/**
	 * If `true`, this production is a family group, an abstract superclass.
	 * If a string, the name of the family that this production extends.
	 * Else, this is not a fmaily group nor does it belong to one.
	 */
	readonly family?: boolean | string,
};

export type EBNFChoice = NonemptyArray<EBNFSequence>;

export type EBNFSequence = NonemptyArray<EBNFItem>;

export type EBNFItem =
	| string
	| { readonly term: string }
	| { readonly prod: string }
;

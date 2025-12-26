export enum Op {
	PLUS,
	HASH,
	OPT,
	SEQ,
	UNSEQ,
	UNCHOICE,
	CHOICE,
}



export type Unop =
	| Op.PLUS
	| Op.HASH
	| Op.OPT
;



export type Binop =
	| Op.SEQ
	| Op.UNSEQ
	| Op.UNCHOICE
	| Op.CHOICE
;

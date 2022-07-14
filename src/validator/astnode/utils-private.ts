import type {
	ASTNodeParam,
	ASTNodeArg,
	ASTNodeCondition,
} from './index';



const defaultComparator: <T>(a: T, b: T) => boolean = (a, b) => a === b || Object.is(a, b);



export type Mutable<T> = {
	-readonly [P in keyof T]: T[P];
};



export const PARAM_SEPARATOR: '_'  = '_';
export const SUB_SEPARATOR:   '__' = '__';
export const FAMILY_SYMBOL:   '$'  = '$';



/**
 * Determines whether a Map has the given key, or whether an “equivalent” key exists in it.
 * “Equivalence” is defined by the given comparator function.
 * @example
 * const my_map: Map<{id: number}, boolean> = new Map([[{id: 42}, true]]);
 * assert.ok(Map_hasEq(my_map, {id: 42}, (a, b) => a.id === b.id));
 * @typeparam K the type of keys in the map
 * @typeparam V the type of values in the map
 * @param map the map to check
 * @param key the key (or an equivalent one) to check
 * @param comparator a function comparing keys in the map
 * @returns whether the key or an equivalent one exists in the map
 */
export function Map_hasEq<K, V>(map: ReadonlyMap<K, V>, key: K, comparator: (a: K, b: K) => boolean = defaultComparator): boolean {
	return map.has(key) || [...map.keys()].some((k) => comparator.call(null, k, key));
}
/**
 * Gets the value of a key in a Map, or an “equivalent” key if one does not already exist in it.
 * “Equivalence” is defined by the given comparator function.
 * @example
 * const my_map: Map<{id: number}, boolean> = new Map([[{id: 42}, true]]);
 * assert.strictEqual(Map_getEq(my_map, {id: 42}, (a, b) => a.id === b.id), true);
 * @typeparam K the type of keys in the map
 * @typeparam V the type of values in the map
 * @param map the map to get from
 * @param key the key (or an equivalent one) whose value to get
 * @param comparator a function comparing keys in the map
 * @returns the value corresponding to the key
 */
export function Map_getEq<K, V>(map: ReadonlyMap<K, V>, key: K, comparator: (a: K, b: K) => boolean = defaultComparator): V | undefined {
	return map.get(key) || [...map].find(([k, _]) => comparator.call(null, k, key))?.[1];
}
/**
 * Sets a value to a key in a Map, or an “equivalent” key if one does not already exist in it.
 * “Equivalence” is defined by the given comparator function.
 * @example
 * const my_map: Map<{id: number}, boolean> = new Map([[{id: 42}, true]]);
 * Map_setEq(my_map, {id: 42}, false, (a, b) => a.id === b.id);
 * assert.strictEqual(Map_getEq(my_map, {id: 42}, (a, b) => a.id === b.id), false);
 * @typeparam K the type of keys in the map
 * @typeparam V the type of values in the map
 * @param map the map to set to
 * @param key the key (or an equivalent one) whose value to set
 * @param comparator a function comparing keys in the map
 * @returns the map
 */
export function Map_setEq<K, V>(map: Map<K, V>, key: K, value: V, comparator: (a: K, b: K) => boolean = defaultComparator): Map<K, V> {
	const foundkey: K | undefined = [...map.keys()].find((k) => comparator.call(null, k, key));
	return map.set((foundkey === void 0) ? key : foundkey, value);
}



export class ConcreteNonterminal {
	/** A counter for internal sub-expressions. Used for naming automated productions. */
	private sub_count: bigint = 0n;

	constructor (
		readonly name: string,
		readonly suffixes: ASTNodeParam[] = [],
	) {
	}

	/**
	 * Generate a new name for a sublist of this ConcreteNonterminal,
	 * incrementing its sub-expression counter each time.
	 * @return a new name for a list containing this ConcreteNonterminal’s current sub-expression counter
	 */
	get newSubexprName(): string {
		return `${ this }${ SUB_SEPARATOR }${ this.sub_count++ }${ SUB_SEPARATOR }List`;
	}

	/** @override */
	toString(): string {
		return this.name.concat(...this.suffixes.flatMap((s) => [PARAM_SEPARATOR, s.source]));
	}

	hasSuffix(p: ASTNodeParam | ASTNodeArg | ASTNodeCondition): boolean {
		return !!this.suffixes.find((suffix) => suffix.source === p.source);
	}
}

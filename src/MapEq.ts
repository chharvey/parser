/**
 * A Map that compares keys via the provided comparator function.
 * Keys that are “equal” (as defined by the comparator) are considered the same key.
 * @example
 * const my_map: MapEq<{id: number}, boolean> = new MapEq((a, b) => a.id === b.id);
 * const key: {id: number} = {id: 42};
 * my_map.set(key,      true);  assert(my_map.get({id: 42}) === true);
 * my_map.set({id: 42}, false); assert(my_map.get(key)      === false);
 * assert(my_map.size === 1);
 */
export class MapEq<K, V> extends Map<K, V> {
	/**
	 * Construct a new MapEq object given a comparator.
	 * The comparator function compares keys in this MapEq.
	 * Keys for which the function returns `true` are considered ”equal” and unique.
	 * If no comparator function is provided, the `SameValueZero` algorithm is used.
	 * @param comparator a function comparing keys in this map
	 * @param items      the items to add to this map
	 */
	constructor (
		private readonly comparator: (a: K, b: K) => boolean = (a, b) => a === b || Object.is(a, b),
		items: readonly (readonly [K, V])[] = [],
	) {
		super(items);
	}
	/**
	 * @inheritdoc
	 * @overrides Map
	 */
	set(key: K, value: V): this {
		return (!this.has(key)) ? super.set(key, value) : this;
	}
	/**
	 * @inheritdoc
	 * @overrides Map
	 */
	get(key: K): V | undefined {
		return super.get(key) || [...this].find(([k, _]) => this.comparator.call(null, k, key))?.[1];
	}
	/**
	 * @inheritdoc
	 * @overrides Map
	 */
	has(key: K): boolean {
		return super.has(key) || [...this].some(([k, _]) => this.comparator.call(null, k, key));
	}
}

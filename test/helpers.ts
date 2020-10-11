import * as assert from 'assert'



/**
 * Return the last index of an iterable.
 * @param   iter an iterable
 * @returns      the number of the last index
 */
export function lastIndex(iter: { length: number }): number {
	return iter.length - 1;
}



/**
 * Return the last item of an iterable.
 * @param   iter an iterable
 * @returns      the last entry
 */
export function lastItem(iter: any[] | string): any {
	return iter[lastIndex(iter)];
}



/**
 * Assert the length of an array or tuple.
 * Useful helper for determining types of items in heterogeneous tuples.
 * @typeParam T   the type of items in the array/tuple
 * @param array   the array or tuple to test
 * @param length  the length to assert
 * @param message the message to send into {@link assert.strictEqual}
 */
export function assert_arrayLength<T>(array: readonly T[], length: 0      , message?: string | Error): asserts array is readonly [];
export function assert_arrayLength<T>(array: readonly T[], length: 1      , message?: string | Error): asserts array is readonly [T];
export function assert_arrayLength<T>(array: readonly T[], length: 2      , message?: string | Error): asserts array is readonly [T, T];
export function assert_arrayLength<T>(array: readonly T[], length: 3      , message?: string | Error): asserts array is readonly [T, T, T];
export function assert_arrayLength<T>(array: readonly T[], length: 4      , message?: string | Error): asserts array is readonly [T, T, T, T];
export function assert_arrayLength<T>(array: readonly T[], length: 5      , message?: string | Error): asserts array is readonly [T, T, T, T, T];
export function assert_arrayLength<T>(array: readonly T[], length: 6      , message?: string | Error): asserts array is readonly [T, T, T, T, T, T];
export function assert_arrayLength<T>(array: readonly T[], length: 7      , message?: string | Error): asserts array is readonly [T, T, T, T, T, T, T];
export function assert_arrayLength<T>(array: readonly T[], length: 8      , message?: string | Error): asserts array is readonly [T, T, T, T, T, T, T, T];
export function assert_arrayLength<T>(array: readonly T[], length: number , message?: string | Error): void;
export function assert_arrayLength<T>(array: readonly T[], length: number , message?: string | Error): void {
	return assert.strictEqual(array.length, length, message)
}

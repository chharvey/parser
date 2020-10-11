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

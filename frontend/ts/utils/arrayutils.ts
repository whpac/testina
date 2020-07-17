/**
 * Tasuje tablicę
 * @param array Tablica do przetasowania, przekazywana jako referencja
 */
export function ShuffleArray<T>(array: Array<T>) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
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

/**
 * Zaokrągla liczbę do wskazanej ilości miejsc po przecinku
 * @param num Liczba do zaokrąglenia
 * @param decimals Ilość miejsc po przecinku (domyślnie 0)
 * @return
 */
export function Round(num: number, decimals: number = 0){
    return Math.round((num + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Ucina nadmiarową część tekstu na końcu słowa
 * @param str Tekst do skrócenia
 * @param length Minimalna liczba znaków do pozostawienia
 */
export function Truncate(str: string, length: number){
    if(str.length <= length) return str;

    let sp_pos = str.indexOf(' ', length);
    if(sp_pos == -1) return str;

    str = str.substr(0, sp_pos);
    return str + '…';
}
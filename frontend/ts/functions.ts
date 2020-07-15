/** @deprecated */
export function GetElement(element_id: string, error_msg?: string): HTMLElement{
    let elem = document.getElementById(element_id);

    if(elem == null){
        let msg = 'Nie odnaleziono elementu #' + element_id + '.';
        if(error_msg !== undefined) msg = error_msg;

        throw msg;
    }

    return elem;
}

/**
 * Formats number of seconds to [hh:]mm:ss
 * @param time_int - number of seconds
 * @return the formatted string
 * @deprecated
 */
export function FormatTime(time_int: number){
    time_int = Math.round(time_int);
    let sec = time_int % 60;
    time_int -= sec;
    time_int /= 60;
    let min = time_int % 60;
    time_int -= min;
    time_int /= 60;
    let hrs = time_int;

    let time_string;
    time_string = sec.toString()
    if(sec < 10) time_string = "0" + time_string;

    time_string = min.toString() + ":" + time_string;
    if(hrs > 0 && min < 10) time_string = "0" + time_string;

    if(hrs > 0) time_string = hrs + ":" + time_string;

    return time_string;
}

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
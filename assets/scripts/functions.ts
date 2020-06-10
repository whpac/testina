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
 * Shuffles the given array
 * @param {array} array - array to shuffle, passed by reference
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
 * Rounds number to specified count of decimals
 * @param num - number to round
 * @param decimals - count of decimals, defaults to 0
 * @return
 */
export function Round(num: number, decimals: number = 0){
    return Math.round((num + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Truncates text at specified length - at the end of word
 * @param str - string to truncate
 * @param length - minimum number of characters to preserve
 */
export function Truncate(str: string, length: number){
    if(str.length <= length) return str;

    let sp_pos = str.indexOf(' ', length);
    if(sp_pos == -1) return str;

    str = str.substr(0, sp_pos);
    return str + '…';
}
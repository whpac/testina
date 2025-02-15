/**
 * Zwraca datę w formacie YYYY-MM-DD HH:MM:SS
 * @param date 
 */
export function ToLongFormat(date: Date) {
    let month = '0' + (date.getMonth() + 1).toString();
    month = month.substr(month.length - 2, 2);
    let day = '0' + date.getDate().toString();
    day = day.substr(day.length - 2, 2);
    let hour = '0' + date.getHours().toString();
    hour = hour.substr(hour.length - 2, 2);
    let minute = '0' + date.getMinutes().toString();
    minute = minute.substr(minute.length - 2, 2);
    let second = '0' + date.getSeconds().toString();
    second = second.substr(second.length - 2, 2);

    let output = '';
    output += date.getFullYear().toString() + '-';
    output += month + '-';
    output += day + ' ';
    output += hour + ':';
    output += minute + ':';
    output += second;
    return output;
}

/**
 * Zwraca datę w formacie HH:MM (jeśli w ciągu ostatnich 24h) albo DD-MM-YYYY, HH:MM
 * @param date Data do sformatowania
 */
export function ToMediumFormat(date: Date, always_display_date: boolean = false) {
    let diff = new Date().getTime() - date.getTime();

    if(Math.abs(diff) < 86400000 && !always_display_date) {
        return date.toLocaleString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        });
    } else {
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

/**
 * Formatuje datę jako DD-MM, HH:MM
 * @param date Data do sformatowania
 */
export function ToDayHourFormat(date: Date) {
    return date.toLocaleString(undefined, {
        month: '2-digit',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Formatuje datę jako DD-MM (jeśli w bieżącym roku) lub DD-MM-YYYY
 * @param date Data do sformatowania
 */
export function ToDayFormat(date: Date) {
    let same_year = new Date().getFullYear() == date.getFullYear();

    if(same_year) {
        return date.toLocaleString(undefined, {
            month: '2-digit',
            day: 'numeric'
        });
    } else {
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: 'numeric'
        });
    }
}

/**
 * Przelicza interwał czasowy na ciąg [HH:]MM:SS
 * @param seconds Ilość sekund
 */
export function SecondsToTime(seconds: number) {
    let secs = seconds % 60;
    seconds = (seconds - secs) / 60;

    let mins = seconds % 60;
    let hrs = (seconds - mins) / 60;

    let s = secs.toString();
    let m = mins.toString();
    if(secs < 10) s = '0' + s;
    if(mins < 10 && hrs != 0) m = '0' + m;

    return (hrs > 0 ? hrs.toString() + ':' : '') + m + ':' + s;
}

/**
 * Zwraca różnicę między datami w sekundach
 * @param date Data
 * @param ref_date Data referencyjna (domyślnie teraz)
 */
export function DiffInSeconds(date: Date, ref_date?: Date) {
    ref_date = ref_date ?? new Date();
    return (date.getTime() - ref_date.getTime()) / 1000;
}
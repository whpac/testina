/**
 * Parses date into HH:MM (if it's in last 24h) or DD-MM-YYYY, HH:MM
 * @param date - date to convert
 */
export function ToMediumFormat(date: Date){
    let diff = new Date().getTime() - date.getTime();

    if(Math.abs(diff) < 86400000){
        return date.toLocaleString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        });
    }else{
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
 * Parses date into or DD-MM, HH:MM
 * @param date - date to convert
 */
export function ToDayHourFormat(date: Date){
    return date.toLocaleString(undefined, {
        month: '2-digit',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Parses date into DD-MM (if it's in this year) or DD-MM-YYYY
 * @param date - date to convert
 */
export function ToDayFormat(date: Date){
    let same_year = new Date().getFullYear() == date.getFullYear();

    if(same_year){
        return date.toLocaleString(undefined, {
            month: '2-digit',
            day: 'numeric'
        });
    }else{
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: 'numeric'
        });
    }
}

export function SecondsToTime(seconds: number){
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

export function DiffInSeconds(date: Date, ref_date?: Date){
    ref_date = ref_date ?? new Date();
    return (date.getTime() - ref_date.getTime()) / 1000;
}
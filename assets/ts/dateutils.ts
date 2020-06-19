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
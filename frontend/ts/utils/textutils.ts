/**
 * Dopasowuje końcówkę fleksyjną do liczby
 * @param n Liczba
 * @param f1 Końcówka formy liczby pojedynczej
 * @param f2 Końcówka formy liczby mnogiej
 * @param f5 Końcówka formy dopełniacza liczby mnogiej
 */
export function n(n: number, f1: string, f2: string, f5?: string) {
    if(n == 1) return f1;
    f5 = f5 ?? f2;

    let n1 = n % 10;
    let n2 = ((n % 100) - n1) / 10;

    if((n1 == 2 || n1 == 3 || n1 == 4) && n2 != 1) return f2;

    return f5;
}

/**
 * Ucina nadmiarową część tekstu na końcu słowa
 * @param str Tekst do skrócenia
 * @param length Minimalna liczba znaków do pozostawienia
 */
export function Truncate(str: string, length: number) {
    if(str.length <= length) return str;

    let sp_pos = str.indexOf(' ', length);
    if(sp_pos == -1) return str;

    str = str.substr(0, sp_pos);
    return str + '…';
}

/**
 * Oblicza hasz ciągu znaków wykorzystując algorytm cyrb53
 * @param str Ciąg znaków
 * @param seed Ziarno modyfikujące wynik
 */
export function Hash(str: string, seed: number = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * Generuje pseudolosowy ciąg znaków o podanej długości. Ciąg wynikowy składa się z zakresu [a-zA-Z0-9].
 * @param length Długość wynikowego ciągu znaków
 */
/*export function RandomString(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for(var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}*/
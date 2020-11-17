/**
 * Dopasowuje końcówkę fleksyjną do liczby
 * @param n Liczba
 * @param f1 Końcówka formy liczby pojedynczej
 * @param f2 Końcówka formy liczby mnogiej
 * @param f5 Końcówka formy dopełniacza liczby mnogiej
 * @param ff Końcówka formy dopełniacza liczby pojedynczej (dla ułamków)
 */
export function n(n: number, f1: string, f2: string, f5?: string, ff?: string) {
    if(n == 1) return f1;
    f5 = f5 ?? f2;
    ff = ff ?? f5;

    if(n % 1 != 0) return ff;

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
 * Dekoduje tekst zapisany z użyciem base64
 * @param base64 Zakodowany tekst
 */
export function Base64Decode(base64: string): string {
    let ascii = window.atob(base64);
    let utf = AsciiToUtf8(ascii);
    return utf;
}

/**
 * Przekształca tekst w ASCII na UTF-8
 * @param ascii Tekst ASCII
 */
function AsciiToUtf8(ascii: string) {
    let utf = '';
    let char_code = 0;
    let code_point = 0;
    let chars_to_join = 0;
    for(let i = 0; i < ascii.length; i++) {
        char_code = ascii.charCodeAt(i);
        if((char_code & 0x80) == 0x80) {
            if((char_code & 0xf0) == 0xf0) {
                chars_to_join = 4;
                code_point = (char_code & 0x07);
            } else if((char_code & 0xe0) == 0xe0) {
                chars_to_join = 3;
                code_point = (char_code & 0x0f);
            } else if((char_code & 0xc0) == 0xc0) {
                chars_to_join = 2;
                code_point = (char_code & 0x1f);
            } else {
                code_point = (code_point << 6) + (char_code & 0x3f);
            }
            chars_to_join--;
            if(code_point == 0) throw 'Nie można przekonwertować ASCII na UTF-8: Natrafiono na błędną sekwencję bajtów.';
        } else {
            code_point = (char_code & 0x7f);
            chars_to_join = 0;
        }
        if(chars_to_join == 0) utf += String.fromCodePoint(code_point);
    }
    return utf;
}
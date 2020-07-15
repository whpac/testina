/**
 * Dopasowuje końcówkę fleksyjną do liczby
 * @param n Liczba
 * @param f1 Końcówka formy liczby pojedynczej
 * @param f2 Końcówka formy liczby mnogiej
 * @param f5 Końcówka formy dopełniacza liczby mnogiej
 */
export function n(n: number, f1: string, f2: string, f5: string){
    if(n == 1) return f1;
    
    let n1 = n % 10;
    let n2 = ((n % 100) - n1) / 10;

    if((n1 == 2 || n1 == 3 || n1 == 4) && n2 != 1) return f2;

    return f5;
}
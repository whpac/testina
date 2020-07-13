/**
 * Adjusts suffix to the count
 * @param n number
 * @param f1 singular form
 * @param f2 double form
 * @param f5 plural form
 */
export function n(n: number, f1: string, f2: string, f5: string){
    if(n == 1) return f1;
    
    let n1 = n % 10;
    let n2 = ((n % 100) - n1) / 10;

    if((n1 == 2 || n1 == 3 || n1 == 4) && n2 != 1) return f2;

    return f5;
}
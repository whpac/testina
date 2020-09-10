import User from '../entities/user';

/**
 * Tasuje tablicę
 * @param array Tablica do przetasowania, przekazywana jako referencja
 */
export function ShuffleArray<T>(array: T[]) {
    for(var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

/**
 * Przenosi element w tablicy
 * @param array Tablica
 * @param from Pozycja, z której przenieść element
 * @param to Pozycja, na którą przenieść element
 */
export function MoveElement<T>(array: T[], from: number, to: number) {
    // Sprawdź, czy pozycje są różne i wewnątrz tablicy
    if(from !== to && 0 <= from && from <= array.length && 0 <= to && to <= array.length) {
        // Przechowaj element do przeniesienia
        let tmp = array[from];

        if(from < to) {
            // Przenieś element dalej, a inne przesuń o jeden bliżej początku
            for(let i = from; i < to; i++) {
                array[i] = array[i + 1];
            }
        } else {
            // Przenieś element bliżej, a inne przesuń o jeden dalej początku
            for(let i = from; i > to; i--) {
                array[i] = array[i - 1];
            }
        }

        // Umieść element w docelowym miejscu
        array[to] = tmp;
    }
}

/**
 * Porównuje użytkowników na podstawie nazwisk, a potem imion
 * @param u1 Pierwszy użytkownik do porównania
 * @param u2 Drugi użytkownik do porównania
 */
export function CompareUsersByName(u1: User, u2: User) {
    // Najpierw porównaj nazwiska
    let ln = u1.LastName.localeCompare(u2.LastName);
    if(ln != 0) return ln;

    // Jeśli nazwiska są takie same, porównaj imiona
    return u1.FirstName.localeCompare(u2.FirstName);
}
import User from '../entities/user';

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
 * Porównuje użytkowników na podstawie nazwisk, a potem imion
 * @param u1 Pierwszy użytkownik do porównania
 * @param u2 Drugi użytkownik do porównania
 */
export function CompareUsersByName(u1: User, u2: User){
    // Najpierw porównaj nazwiska
    let ln = u1.LastName.localeCompare(u2.LastName);
    if(ln != 0) return ln;

    // Jeśli nazwiska są takie same, porównaj imiona
    return u1.FirstName.localeCompare(u2.FirstName);
}
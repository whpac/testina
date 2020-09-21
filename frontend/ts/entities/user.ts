import Entity from './entity';

/** Klasa reprezentująca użytkownika */
export default class User extends Entity {
    /** Unikatowy identyfikator użytkownika */
    public readonly Id: number;
    /** Imię użytkownika */
    public readonly FirstName: string;
    /** Nazwisko użytkownika */
    public readonly LastName: string;

    /**
     * Klasa reprezentująca użytkownika
     * @param id Identyfikator użytkownika
     * @param first_name Imię użytkownika
     * @param last_name Nazwisko użytkownika
     */
    constructor(id: number, first_name: string, last_name: string) {
        super();

        if(id === undefined || first_name === undefined || last_name === undefined)
            throw new TypeError('Wszystkie parametry konstruktora User() muszą być zdefiniowane.');

        this.Id = id;
        this.FirstName = first_name;
        this.LastName = last_name;
    }

    /** Zwraca imię i nazwisko użytkownika */
    GetFullName() {
        return this.FirstName + ' ' + this.LastName;
    }

    /** Zwraca inicjał imienia i nazwisko użytkownika */
    GetInitial() {
        return this.FirstName.charAt(0) + '. ' + this.LastName;
    }

    /** Czy użytkownik jest kobietą? (Na podstawie ostatniej litery imienia) */
    IsFemale() {
        return this.FirstName.endsWith('a');
    }
}
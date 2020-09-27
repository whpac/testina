import Entity from './entity';

/** Klasa reprezentująca grupę */
export default class Group extends Entity {
    /** Unikatowy identyfikator grupy */
    public readonly Id: string;
    /** Nazwa grupy */
    public readonly Name: string;

    /**
     * Klasa reprezentująca grupę
     * @param id Identyfikator grupy
     * @param name Nazwa grupy
     */
    constructor(id: string, name: string) {
        super();

        if(id === undefined || name === undefined)
            throw new TypeError('Wszystkie parametry konstruktora Group() muszą być zdefiniowane.');

        this.Id = id;
        this.Name = name;
    }
}
import Entity from './entity';

/** Klasa reprezentująca grupę */
export default class Group extends Entity {
    /** Unikatowy identyfikator grupy */
    public readonly Id: number;
    /** Nazwa grupy */
    public readonly Name: string;

    /**
     * Klasa reprezentująca grupę
     * @param id Identyfikator grupy
     * @param name Nazwa grupy
     */
    constructor(id: number, name: string){
        super();

        this.Id = id;
        this.Name = name;
    }
}
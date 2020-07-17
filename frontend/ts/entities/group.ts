import * as XHR from '../utils/xhr';
import Entity, { Collection } from './entity';

/** Deskryptor grupy w odpowiedzi z API */
export interface GroupDescriptor {
    id: number,
    name: string
}

/** Klasa reprezentująca grupę */
export default class Group extends Entity {
    /** Unikatowy identyfikator grupy */
    protected id: number;
    /** Nazwa grupy */
    protected name: string | undefined;

    /** Reprezentuje status operacji pobierania danych */
    private _fetch_awaiter: Promise<void> | undefined;

    /**
     * Klasa reprezentująca grupę
     * @param group Identyfikator grupy lub deskryptor
     */
    constructor(group: number | GroupDescriptor){
        super();

        if(typeof group === 'number'){
            this.id = group;
            this._fetch_awaiter = this.Fetch();
        }else{
            this.id = group.id;
            this.Populate(group);
        }
    }

    /** Zwraca wszystkie grupy */
    static async GetAll(){
        let response = await XHR.Request('api/groups?depth=3', 'GET');
        let json = response.Response as Collection<GroupDescriptor>;
        let out_array: Group[] = [];

        Object.keys(json).forEach((group_id) => {
            out_array.push(new Group(json[parseInt(group_id)]));
        });

        return out_array;
    }

    /** Pobiera grupę z serwera */
    protected async Fetch(){
        let response = await XHR.Request(this.GetApiUrl() + '?depth=2', 'GET');
        let json = response.Response as GroupDescriptor;
        this.Populate(json);
    }

    /**
     * Wypełnia właściwości według danych w deskryptorze
     * @param descriptor Deskryptor grupy
     */
    protected Populate(descriptor: GroupDescriptor){
        this.name = descriptor.name;
    }

    /** Adres grupy w API */
    GetApiUrl(){
        return 'api/groups/' + this.id;
    }

    /** Zwraca identyfikator grupy */
    GetId(): number{
        return this.id;
    }

    /** Zwraca nazwę grupy */
    async GetName(): Promise<string>{
        await this?._fetch_awaiter;
        return this.name as string;
    }
}
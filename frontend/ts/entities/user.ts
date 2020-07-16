import Entity, { Collection } from './entity';

import * as XHR from '../xhr';

/** Deskryptor użytkownika w odpowiedzi z API */
export interface UserDescriptor {
    id: number,
    first_name: string,
    last_name: string
}

/** Klasa reprezentująca użytkownika */
export default class User extends Entity {
    /** Unikatowy identyfikator użytkownika */
    protected id: number;
    /** Imię użytkownika */
    protected first_name: string | undefined;
    /** Nazwisko użytkownika */
    protected last_name: string | undefined;

    /** Reprezentuje stan pobierania danych z serwera */
    private _fetch_awaiter: Promise<void> | undefined;
    /** Przechowuje aktualnie zalogowanego użytkownika */
    protected static CurrentUser: (User | undefined) = undefined;

    /**
     * Klasa reprezentująca użytkownika
     * @param user Identyfikator użytkownika lub deskryptor
     */
    constructor(user: number | UserDescriptor){
        super();

        if(typeof user === 'number'){
            this.id = user;
            this._fetch_awaiter = this.Fetch();
        }else{
            this.id = user.id;
            this.Populate(user);
        }
    }

    /**
     * Zwraca aktualnie zalogowanego użytkownika
     * @param force Czy wymusić załadowanie nowych danych
     */
    static async GetCurrent(force: boolean = false){
        if(this.CurrentUser === undefined || force){
            let response = await XHR.Request('api/users/current?depth=2', 'GET');
            let json = response.Response as UserDescriptor;
            this.CurrentUser = new User(json);
        }
        return this.CurrentUser;
    }

    /** Pobiera dane z serwera */
    protected async Fetch(){
        let response = await XHR.Request(this.GetApiUrl() + '?depth=2', 'GET');
        let json = response.Response as UserDescriptor;
        this.Populate(json);
    }

    /**
     * Ustawia właściwości zgodnie z deskryptorem
     * @param descriptor Deskryptor użytkownika
     */
    protected Populate(descriptor: UserDescriptor){
        this.first_name = descriptor.first_name;
        this.last_name = descriptor.last_name;
    }

    static async GetAll(){
        let response = await XHR.Request('api/users?depth=3', 'GET');
        let json = response.Response as Collection<UserDescriptor>;

        let user_ids = Object.keys(json);
        let users: User[] = [];
        for(let user_id of user_ids){
            if(user_id == 'current') continue;
            users.push(new User(json[parseInt(user_id)]));
        }
        return users;
    }

    /** Zwraca adres użytkownika w API */
    GetApiUrl(){
        return 'api/users/' + this.id;
    }

    /** Zwraca identyfikator użytkownika */
    GetId(): number{
        return this.id;
    }

    /** Zwraca imię i nazwisko użytkownika */
    async GetName(): Promise<string>{
        await this._fetch_awaiter;
        return (this.first_name as string) + ' ' + (this.last_name as string);
    }

    /** Czy użytkownik jest kobietą? (Na podstawie ostatniej litery imienia) */
    async IsFemale(): Promise<boolean>{
        await this._fetch_awaiter;
        return this.first_name?.endsWith('a') ?? false;
    }
}
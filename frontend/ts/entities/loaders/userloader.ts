import * as XHR from '../../utils/xhr';
import User from '../user';
import { Collection } from '../entity';

/** Deskryptor użytkownika w odpowiedzi z API */
export interface UserDescriptor {
    id: number,
    first_name: string,
    last_name: string
}

export default class UserLoader {
    /** Przechowuje aktualnie zalogowanego użytkownika */
    protected static CurrentUser: (User | undefined) = undefined;

    /**
     * Wczytuje użytkownika o określonym identyfikatorze
     * @param user_id Identyfikator użytkownika
     */
    public static async LoadById(user_id: number){
        let response = await XHR.Request('api/user/' + user_id.toString() + '?depth=2', 'GET');
        let json = response.Response as UserDescriptor;
        return this.CreateFromDescriptor(json);
    }

    /**
     * Tworzy użytkownika na podstawie deskryptora
     * @param user_descriptor Deskryptor użytkownika
     */
    public static CreateFromDescriptor(user_descriptor: UserDescriptor){
        return new User(
            user_descriptor.id,
            user_descriptor.first_name,
            user_descriptor.last_name
        );
    }

    /** Wczytuje wszystkich zarejestrowanych użytkowników */
    public static async GetAll(){
        let response = await XHR.Request('api/users?depth=3', 'GET');
        let json = response.Response as Collection<UserDescriptor>;

        let user_ids = Object.keys(json);
        let users: User[] = [];
        for(let user_id of user_ids){
            if(user_id == 'current') continue;
            users.push(this.CreateFromDescriptor(json[parseInt(user_id)]));
        }
        return users;
    }

    /**
     * Zwraca bieżącego użytkownika
     * @param force Czy wymusić wczytanie z serwera
     */
    public static async GetCurrent(force: boolean = false){
        if(this.CurrentUser === undefined || force){
            let response = await XHR.Request('api/users/current?depth=2', 'GET');
            let json = response.Response as UserDescriptor;
            this.CurrentUser = this.CreateFromDescriptor(json);
        }
        return this.CurrentUser;
    }
}
import * as XHR from '../../utils/xhr';
import User from '../user';
import { Collection } from '../entity';
import Loader from './loader';
import FetchingErrorException from '../../exceptions/fetching_error';

/** Deskryptor użytkownika w odpowiedzi z API */
export interface UserDescriptor {
    id: number,
    first_name: string,
    last_name: string;
}

export default class UserLoader implements Loader<User> {
    /** Przechowuje aktualnie zalogowanego użytkownika */
    protected static CurrentUser: (User | undefined) = undefined;

    /**
     * Wczytuje użytkowników o określonym identyfikatorze
     * @param user_id Identyfikatory użytkowników
     */
    LoadById(user_id: number): Promise<User>;
    LoadById(user_id: number[]): Promise<User[]>;
    public async LoadById(user_id: number | number[]): Promise<User | User[]> {
        if(typeof user_id == 'number') {
            let descriptor: UserDescriptor;
            let response = await XHR.PerformRequest('api/users/' + user_id.toString() + '?depth=2', 'GET');
            descriptor = response.Response as UserDescriptor;

            try {
                return UserLoader.CreateFromDescriptor(descriptor);
            } catch(e) {
                if(e instanceof TypeError) {
                    return UserLoader.LoadById(user_id);
                } else throw e;
            }
        } else {
            let users: User[] = [];
            for(let id of user_id) {
                let response = await XHR.PerformRequest('api/users/' + id.toString() + '?depth=2', 'GET');
                let descriptor = response.Response as UserDescriptor;
                users.push(UserLoader.CreateFromDescriptor(descriptor));
            }
            return users;
        }
    }

    /**
     * Wczytuje użytkowników o określonym identyfikatorze
     * @param user_id Identyfikatory użytkowników
     */
    static LoadById(user_id: number): Promise<User>;
    static LoadById(user_id: number[]): Promise<User[]>;
    public static async LoadById(user_id: number | number[]): Promise<User | User[]> {
        //@ts-ignore - Kompilator niesłusznie zwraca błąd
        return new UserLoader().LoadById(user_id);
    }

    /**
     * Tworzy użytkownika na podstawie deskryptora
     * @param user_descriptor Deskryptor użytkownika
     */
    public static CreateFromDescriptor(user_descriptor: UserDescriptor) {
        return new User(
            user_descriptor.id,
            user_descriptor.first_name,
            user_descriptor.last_name
        );
    }

    /** Wczytuje wszystkich zarejestrowanych użytkowników */
    public static async GetAll() {
        let descriptors: Collection<UserDescriptor>;
        let response = await XHR.PerformRequest('api/users?depth=3', 'GET');
        descriptors = response.Response as Collection<UserDescriptor>;

        let user_ids = Object.keys(descriptors);
        let users: User[] = [];
        for(let user_id of user_ids) {
            if(user_id == 'current') continue;
            let u: User;
            try {
                u = UserLoader.CreateFromDescriptor(descriptors[parseInt(user_id)]);
            } catch(e) {
                if(e instanceof TypeError) {
                    u = await UserLoader.LoadById(parseInt(user_id));
                } else throw e;
            }
            users.push(u);
        }
        return users;
    }

    /**
     * Zwraca bieżącego użytkownika lub undefined, jeśli nie zalogowano
     * @param force Czy wymusić wczytanie z serwera
     */
    public static async GetCurrent(force: boolean = false) {
        if(this.CurrentUser === undefined || force) {
            try {
                let response = await XHR.PerformRequest('api/users/current?depth=2', 'GET');
                let json = response.Response as UserDescriptor;
                this.CurrentUser = this.CreateFromDescriptor(json);
            } catch(e) {
                // Zwróć undefined, jeśli kod odpowiedzi to 401, czyli niezalogowany
                if(e instanceof FetchingErrorException) {
                    if(e.Data.Status == 401) return undefined;
                    else throw e;
                } else throw e;
            }
        }
        return this.CurrentUser;
    }
}
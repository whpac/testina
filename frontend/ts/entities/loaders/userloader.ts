import XHR from '../../network/xhr';
import User from '../user';
import FetchingErrorException from '../../exceptions/fetching_error';
import { StringKeyedCollection } from '../question_with_user_answers';

/** Deskryptor użytkownika w odpowiedzi z API */
export interface UserDescriptor {
    id: string;
    first_name: string;
    last_name: string;
    is_test_creator: boolean;
}

export default class UserLoader {
    /** Przechowuje aktualnie zalogowanego użytkownika */
    protected static CurrentUser: (User | undefined) = undefined;

    /**
     * Wczytuje użytkowników o określonym identyfikatorze
     * @param user_id Identyfikatory użytkowników
     */
    LoadById(user_id: string | 0): Promise<User>;
    LoadById(user_id: string[]): Promise<User[]>;
    public async LoadById(user_id: string | string[] | 0): Promise<User | User[]> {
        if(user_id === 0) return new User('0', 'Nieznany', 'użytkownik', false);

        if(typeof user_id == 'string') {
            try {
                let response = await XHR.PerformRequest('api/users/' + user_id + '?depth=2', 'GET');
                let descriptor = response.Response as UserDescriptor;

                return UserLoader.CreateFromDescriptor(descriptor);
            } catch(e) {
                if(e instanceof FetchingErrorException) {
                    return UserLoader.CreateFromDescriptor({
                        id: user_id,
                        first_name: 'Błąd',
                        last_name: 'wczytywania',
                        is_test_creator: false
                    });
                }
                throw e;
            }
        } else {
            let users: User[] = [];
            for(let id of user_id) {
                try {
                    let response = await XHR.PerformRequest('api/users/' + id + '?depth=2', 'GET');
                    let descriptor = response.Response as UserDescriptor;
                    users.push(UserLoader.CreateFromDescriptor(descriptor));
                } catch(e) {
                    // W przypadku błędu ładowania jednego z użytkowników nie rób nic
                    if(!(e instanceof FetchingErrorException)) throw e;
                }
            }
            return users;
        }
    }

    /**
     * Wczytuje użytkowników o określonym identyfikatorze
     * @param user_id Identyfikatory użytkowników
     */
    static LoadById(user_id: string): Promise<User>;
    static LoadById(user_id: string[]): Promise<User[]>;
    public static async LoadById(user_id: string | string[]): Promise<User | User[]> {
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
            user_descriptor.last_name,
            user_descriptor.is_test_creator
        );
    }

    /** Wczytuje wszystkich zarejestrowanych użytkowników */
    public static async GetAll() {
        let descriptors: StringKeyedCollection<UserDescriptor>;
        let response = await XHR.PerformRequest('api/users?depth=3', 'GET');
        descriptors = response.Response as StringKeyedCollection<UserDescriptor>;

        let users: User[] = [];
        for(let user_id in descriptors) {
            if(user_id == 'current') continue;
            let u: User;
            try {
                u = UserLoader.CreateFromDescriptor(descriptors[user_id]);
            } catch(e) {
                if(e instanceof TypeError) {
                    u = await UserLoader.LoadById(user_id);
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
                let response = await XHR.PerformRequest('api/users/current?depth=2', 'GET', undefined, force);
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

    public static ClearCurrentUserCache() {
        this.CurrentUser = undefined;
    }
}
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
    protected UserDescriptors: Collection<UserDescriptor> | undefined;

    public SaveDescriptors(user_descriptors: Collection<UserDescriptor>){
        this.UserDescriptors = user_descriptors;
    }

    /**
     * Wczytuje użytkownika o określonym identyfikatorze
     * @param user_id Identyfikator użytkownika
     */
    public async LoadById(user_id: number): Promise<User>{
        let descriptor: UserDescriptor;
        if(this.UserDescriptors?.[user_id] !== undefined){
            descriptor = this.UserDescriptors?.[user_id];
        }else{
            let response = await XHR.Request('api/users/' + user_id.toString() + '?depth=2', 'GET');
            descriptor = response.Response as UserDescriptor;
        }
        try{
            return UserLoader.CreateFromDescriptor(descriptor);
        }catch(e){
            if(e instanceof TypeError){
                return UserLoader.LoadById(user_id);
            }else throw e;
        }
    }

    /**
     * Wczytuje użytkownika o określonym identyfikatorze
     * @param user_id Identyfikator użytkownika
     */
    public static async LoadById(user_id: number){
        let loader = new UserLoader();
        return loader.LoadById(user_id);
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

    public async GetAll(){
        let descriptors: Collection<UserDescriptor>;
        if(this.UserDescriptors !== undefined){
            descriptors = this.UserDescriptors;
        }else{
            let response = await XHR.Request('api/users?depth=3', 'GET');
            descriptors = response.Response as Collection<UserDescriptor>;
        }

        let user_ids = Object.keys(descriptors);
        let users: User[] = [];
        for(let user_id of user_ids){
            if(user_id == 'current') continue;
            let u: User;
            try{
                u = UserLoader.CreateFromDescriptor(descriptors[parseInt(user_id)]);
            }catch(e){
                if(e instanceof TypeError){
                    u = await UserLoader.LoadById(parseInt(user_id));
                }else throw e;
            }
            users.push(u);
        }
        return users;
    }

    /** Wczytuje wszystkich zarejestrowanych użytkowników */
    public static async GetAll(){
        let loader = new UserLoader();
        return loader.GetAll();
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
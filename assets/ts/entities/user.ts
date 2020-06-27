import Entity from './entity';

import * as XHR from '../xhr';

export interface UserDescriptor {
    id: number,
    first_name: string,
    last_name: string
}

type UserCollection = {
    [user_id: number]: UserDescriptor
}

export default class User extends Entity {
    protected id: number;
    protected first_name: string | undefined;
    protected last_name: string | undefined;

    private _fetch_awaiter: Promise<void> | undefined;
    protected static CurrentUser: (User | undefined) = undefined;

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

    static async GetCurrent(force: boolean = false){
        if(this.CurrentUser === undefined || force){
            let response = await XHR.Request('api/users/current?depth=2', 'GET');
            let json = response.Response as UserDescriptor;
            this.CurrentUser = new User(json);
        }
        return this.CurrentUser;
    }

    protected async Fetch(){
        let response = await XHR.Request(this.GetApiUrl() + '?depth=2', 'GET');
        let json = response.Response as UserDescriptor;
        this.Populate(json);
    }

    protected Populate(descriptor: UserDescriptor){
        this.first_name = descriptor.first_name;
        this.last_name = descriptor.last_name;
    }

    GetApiUrl(){
        return 'api/users/' + this.id;
    }

    GetId(): number{
        return this.id;
    }

    async GetName(): Promise<string>{
        await this._fetch_awaiter;
        return (this.first_name as string) + ' ' + (this.last_name as string);
    }

    async IsFemale(): Promise<boolean>{
        await this._fetch_awaiter;
        return this.first_name?.endsWith('a') ?? false;
    }
}
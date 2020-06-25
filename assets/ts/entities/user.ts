import Entity from './entity';

import * as XHR from '../xhr';

export interface UserDescriptor {
    id: number,
    name: string
}

type UserCollection = {
    [user_id: number]: UserDescriptor
}

export default class User extends Entity {
    protected id: number;
    protected name: string | undefined;

    private _fetch_awaiter: Promise<void> | undefined;

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

    protected async Fetch(){
        let response = await XHR.Request(this.GetApiUrl() + '?depth=2', 'GET');
        let json = response.Response as UserDescriptor;
        this.Populate(json);
    }

    protected Populate(descriptor: UserDescriptor){
        this.name = descriptor.name;
    }

    GetApiUrl(){
        return 'api/users/' + this.id;
    }

    GetId(): number{
        return this.id;
    }

    async GetName(): Promise<string>{
        await this._fetch_awaiter;
        return this.name as string;
    }
}
import * as XHR from '../xhr';
import Entity from './entity';

interface TestDescriptor {
    id: number,
    name: string,
    author: {},
    creation_date: string,
    time_limit: number,
    question_multiplier: number,
    questions: {}
}

type TestCollection = {
    [test_id: number]: TestDescriptor
}

export default class Test extends Entity {
    protected id: number;
    protected name: string | undefined;
    protected author_id: number | undefined;
    protected creation_date: Date | undefined;
    protected time_limit: number | undefined;
    protected question_multiplier: number | undefined;
    protected question_count: number | undefined;

    private _fetch_awaiter: Promise<void> | undefined;

    constructor(test: number | TestDescriptor){
        super();
        
        if(typeof test === 'number'){
            this.id = test;
            this._fetch_awaiter = this.Fetch();
        }else{
            this.id = test.id;
            this.Populate(test);
        }
    }

    static async GetAll(){
        let response = await XHR.Request('api/tests?depth=3', 'GET');
        let json: TestCollection = JSON.parse(response.ResponseText);
        let out_array: Test[] = [];

        Object.keys(json).forEach((test_id) => {
            out_array.push(new Test(json[parseInt(test_id)]));
        });

        return out_array;
    }

    protected async Fetch(){
        let response = await XHR.Request('api/tests/' + this.id + '?depth=2', 'GET');
        let json: TestDescriptor = JSON.parse(response.ResponseText);
        this.Populate(json);
    }

    protected Populate(descriptor: TestDescriptor){
        this.name = descriptor.name;
        //this.author_id = descriptor.author.id;
        this.creation_date = new Date(descriptor.creation_date);
        this.time_limit = descriptor.time_limit;
        this.question_multiplier = descriptor.question_multiplier;
        this.question_count = Object.keys(descriptor.questions).length;
    }

    GetId(): number{
        return this.id;
    }

    async GetName(): Promise<string>{
        await this?._fetch_awaiter;
        return this.name as string;
    }

    /*async GetAuthor(): Promise<never>{
        await this?._fetch_awaiter;
        return this.author_id;
    }*/

    async GetCreationDate(): Promise<Date>{
        await this?._fetch_awaiter;
        return this.creation_date as Date;
    }

    async GetTimeLimit(): Promise<number>{
        await this?._fetch_awaiter;
        return this.time_limit as number;
    }

    async GetQuestionMultiplier(): Promise<number>{
        await this?._fetch_awaiter;
        return this.question_multiplier as number;
    }

    async GetQuestionCount(): Promise<number>{
        await this?._fetch_awaiter;
        return this.question_count as number;
    }

    async HasTimeLimit(): Promise<boolean>{
        return (await this.GetTimeLimit()) != 0;
    }

    async Remove(){
        let result = await XHR.Request('api/tests/' + this.id, 'DELETE');
        if(result.Status == 204){
            // this.OnChange();
            return true;
        } else return false;
    }
}
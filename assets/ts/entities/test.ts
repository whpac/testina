import * as XHR from '../xhr';
import Entity from './entity';
import User from './user';
import PageParams from '../1page/pageparams';

import { UserDescriptor } from './user';
import Question, { QuestionDescriptor } from './question';

export interface TestDescriptor {
    id: number,
    name: string,
    author: UserDescriptor,
    creation_date: string,
    time_limit: number,
    question_multiplier: number,
    question_count: number,
    questions: QuestionDescriptor[]
}

type TestCollection = {
    [test_id: number]: TestDescriptor
}

export default class Test extends Entity implements PageParams {
    protected id: number;
    protected name: string | undefined;
    protected author: User | undefined;
    protected creation_date: Date | undefined;
    protected time_limit: number | undefined;
    protected question_multiplier: number | undefined;
    protected question_count: number | undefined;
    
    protected question_descriptors: QuestionDescriptor[] | undefined;
    protected questions: Question[] | undefined;

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
        let json = response.Response as TestCollection;
        let out_array: Test[] = [];

        Object.keys(json).forEach((test_id) => {
            out_array.push(new Test(json[parseInt(test_id)]));
        });

        return out_array;
    }

    protected async Fetch(){
        let response = await XHR.Request(this.GetApiUrl() + '?depth=2', 'GET');
        let json = response.Response as TestDescriptor;
        this.Populate(json);
    }

    protected Populate(descriptor: TestDescriptor){
        this.name = descriptor.name;
        this.author = new User(descriptor.author);
        this.creation_date = new Date(descriptor.creation_date);
        this.time_limit = descriptor.time_limit;
        this.question_multiplier = descriptor.question_multiplier;
        this.question_count = descriptor.question_count;
        this.question_descriptors = [];

        if(descriptor.questions !== undefined){
            Object.keys(descriptor.questions).forEach((q_id) => {
                this.question_descriptors?.push(descriptor.questions[parseInt(q_id)]);
            });
        }
    }

    GetApiUrl(){
        return 'api/tests/' + this.id;
    }

    GetId(): number{
        return this.id;
    }

    async GetName(): Promise<string>{
        await this?._fetch_awaiter;
        return this.name as string;
    }

    async GetAuthor(): Promise<User>{
        await this?._fetch_awaiter;
        return this.author as User;
    }

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

    async GetQuestions(): Promise<Question[]>{
        await this?._fetch_awaiter;

        if(this.questions !== undefined) return this.questions;

        let first_question = (this.question_descriptors ?? [null])[0];
        if(first_question === undefined || first_question === null || Object.keys(first_question).length == 0){
            this.questions = await Question.GetForTest(this);
        }else{
            this.questions = [];
            this.question_descriptors?.forEach((descriptor) => {
                this.questions?.push(new Question(this, descriptor));
            });
        }
        return this.questions;
    }

    static async Create(name: string, question_multiplier: number, time_limit: number){
        let request_data = {
            name: name,
            question_multiplier: question_multiplier,
            time_limit: time_limit
        };
        let result = await XHR.Request('api/tests', 'POST', request_data);
        
        if(result.Status != 201) throw result;
        
        return new Test(parseInt(result.ContentLocation));
    }

    async Remove(){
        let result = await XHR.Request(this.GetApiUrl(), 'DELETE');
        if(result.Status == 204){
            this.FireEvent('remove');
        }else throw result;
    }

    async UpdateSettings(name: string, question_multiplier: number, time_limit: number){
        let request_data = {
            name: name,
            question_multiplier: question_multiplier,
            time_limit: time_limit
        };
        let result = await XHR.Request(this.GetApiUrl(), 'PUT', request_data);
        if(result.Status == 204){
            this.name = name;
            this.question_multiplier = question_multiplier;
            this.time_limit = time_limit;
            this.FireEvent('change');
        }else throw result;
    }

    GetSimpleRepresentation(){
        return {
            type: 'test',
            id: this.GetId()
        };
    }

    OnQuestionAdded(){
        if(this.question_count === undefined) this.question_count = 0;
        this.question_count++;
        this.FireEvent('change');
    }

    OnQuestionRemoved(){
        if(this.question_count === undefined || this.question_count < 1) return;
        this.question_count--;
        this.FireEvent('change');
    }
}
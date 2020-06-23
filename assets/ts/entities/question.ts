import * as XHR from '../xhr';
import Test from './test';
import Entity from './entity';
import { RemoveTestXHR } from '../remote_ifaces';

interface QuestionDescriptor {
    id: number,
    text: string,
    type: number,
    points: number,
    points_counting: number,
    max_typos: number,
    answers: {}
}

type QuestionCollection = {
    [question_id: number]: QuestionDescriptor
}

export default class Question extends Entity {
    public static TYPE_SINGLE_CHOICE = 0;
    public static TYPE_MULTI_CHOICE = 1;
    public static TYPE_OPEN_ANSWER = 2;

    public static COUNTING_LINEAR = 0;
    public static COUNTING_BINARY = 1;

    protected id: number;
    protected test: Test;
    protected text: string | undefined;
    protected type: number | undefined;
    protected points: number | undefined;
    protected points_counting: number | undefined;
    protected max_typos: number | undefined;
    protected answer_count: number | undefined;

    private _fetch_awaiter: Promise<void> | undefined;

    constructor(test: Test, question: number | QuestionDescriptor){
        super();

        this.test = test;
        if(typeof question === 'number'){
            this.id = question;
            this._fetch_awaiter = this.Fetch();
        }else{
            this.id = question.id;
            this.Populate(question);
        }
    }

    static async GetForTest(test: Test){
        let response = await XHR.Request(test.GetApiUrl() + '/questions?depth=3', 'GET');
        let json = response.Response as QuestionCollection;
        let out_array: Question[] = [];

        Object.keys(json).forEach((test_id) => {
            out_array.push(new Question(test, json[parseInt(test_id)]));
        });

        return out_array;
    }

    protected async Fetch(){
        let response = await XHR.Request(this.GetApiUrl() + '?depth=2', 'GET');
        let json = response.Response as QuestionDescriptor;
        this.Populate(json);
    }

    protected Populate(descriptor: QuestionDescriptor){
        this.text = descriptor.text;
        this.type = descriptor.type;
        this.points = descriptor.points;
        this.points_counting = descriptor.points_counting;
        this.max_typos = descriptor.max_typos;
        this.answer_count = Object.keys(descriptor.answers).length;
    }

    GetApiUrl(){
        return this.test.GetApiUrl() + '/questions/' + this.id;
    }

    GetId(): number{
        return this.id;
    }

    async GetText(): Promise<string>{
        await this?._fetch_awaiter;
        return this.text as string;
    }

    async GetType(): Promise<number>{
        await this?._fetch_awaiter;
        return this.type as number;
    }

    async GetPoints(): Promise<number>{
        await this?._fetch_awaiter;
        return this.points as number;
    }

    async GetPointsCounting(): Promise<number>{
        await this?._fetch_awaiter;
        return this.points_counting as number;
    }

    async GetMaxTypos(): Promise<number>{
        await this?._fetch_awaiter;
        return this.max_typos as number;
    }

    async GetAnswerCount(): Promise<number>{
        await this?._fetch_awaiter;
        return this.answer_count as number;
    }

    static async Create(test: Test, text: string, type: number, points: number, points_counting: number, max_typos: number){
        let request_data = {
            text: text,
            type: type,
            points: points,
            points_counting: points_counting,
            max_typos: max_typos
        };
        let result = await XHR.Request(test.GetApiUrl() + '/questions', 'POST', request_data);
        
        if(result.Status != 201) throw result;

        test.OnQuestionAdded();
        
        return new Question(test, parseInt(result.ContentLocation));
    }

    async Update(text: string, type: number, points: number, points_counting: number, max_typos: number){
        let request_data = {
            text: text,
            type: type,
            points: points,
            points_counting: points_counting,
            max_typos: max_typos
        };
        let result = await XHR.Request(this.GetApiUrl(), 'PUT', request_data);
        if(result.Status == 204){
            this.text = text;
            this.type = type;
            this.points = points;
            this.points_counting = points_counting;
            this.max_typos = max_typos;
            this.FireEvent('change');
        } else throw result;
    }

    async Remove(){
        let result = await XHR.Request(this.GetApiUrl(), 'DELETE');
        if(result.Status == 204){
            this.FireEvent('remove');
            this.test.OnQuestionRemoved();
        }else throw result;
    }
}
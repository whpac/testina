import * as XHR from '../xhr';
import Test from './test';

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

export default class Question {
    protected id: number;
    protected test_id: number;
    protected text: string | undefined;
    protected type: number | undefined;
    protected points: number | undefined;
    protected points_counting: number | undefined;
    protected max_typos: number | undefined;
    protected answer_count: number | undefined;

    private _fetch_awaiter: Promise<void> | undefined;

    constructor(test: Test, question: number | QuestionDescriptor){
        this.test_id = test.GetId();
        if(typeof question === 'number'){
            this.id = question;
            this._fetch_awaiter = this.Fetch();
        }else{
            this.id = question.id;
            this.Populate(question);
        }
    }

    static async GetForTest(test: Test){
        let response = await XHR.Request('api/tests/' + test.GetId() + '/questions?depth=3', 'GET');
        let json: QuestionCollection = JSON.parse(response.ResponseText);
        let out_array: Question[] = [];

        Object.keys(json).forEach((test_id) => {
            out_array.push(new Question(test, json[parseInt(test_id)]));
        });

        return out_array;
    }

    protected async Fetch(){
        let response = await XHR.Request('api/tests/' + this.test_id + '/questions/' + this.id + '?depth=2', 'GET');
        let json: QuestionDescriptor = JSON.parse(response.ResponseText);
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
}
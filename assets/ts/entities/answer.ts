import Entity from './entity';
import Question from './question';

import * as XHR from '../xhr';

export interface AnswerDescriptor {
    id: number,
    text: string,
    correct: boolean
}

/** @deprecated */
export type AnswerCollection = {
    [answer_id: number]: AnswerDescriptor
}

export default class Answer extends Entity {
    protected id: number;
    protected question: Question;
    protected text: string | undefined;
    protected correct: boolean | undefined;

    private _fetch_awaiter: Promise<void> | undefined;

    constructor(question: Question, answer: number | AnswerDescriptor){
        super();

        this.question = question;
        if(typeof answer === 'number'){
            this.id = answer;
            this._fetch_awaiter = this.Fetch();
        }else{
            this.id = answer.id;
            this.Populate(answer);
        }
    }

    static async GetForQuestion(question: Question){
        let response = await XHR.Request(question.GetApiUrl() + '/answers?depth=3', 'GET');
        let json = response.Response as AnswerCollection;
        let out_array: Answer[] = [];

        Object.keys(json).forEach((question_id) => {
            out_array.push(new Answer(question, json[parseInt(question_id)]));
        });

        return out_array;
    }

    protected async Fetch(){
        let response = await XHR.Request(this.GetApiUrl() + '?depth=2', 'GET');
        let json = response.Response as AnswerDescriptor;
        this.Populate(json);
    }

    protected Populate(descriptor: AnswerDescriptor){
        this.text = descriptor.text;
        this.correct = descriptor.correct;
    }

    GetApiUrl(){
        return this.question.GetApiUrl() + '/answers/' + this.id;
    }

    GetId(): number{
        return this.id;
    }

    async GetText(): Promise<string>{
        await this._fetch_awaiter;
        return this.text as string;
    }

    async IsCorrect(): Promise<boolean>{
        await this._fetch_awaiter;
        return this.correct as boolean;
    }

    static async Create(question: Question, text: string, correct: boolean){
        let request_data = {
            text: text,
            correct: correct
        };
        let result = await XHR.Request(question.GetApiUrl() + '/answers', 'POST', request_data);
        
        if(result.Status != 201) throw result;
    }

    async Update(text: string, correct: boolean){
        let request_data = {
            text: text,
            correct: correct
        };
        let result = await XHR.Request(this.GetApiUrl(), 'PUT', request_data);
        if(result.Status == 204){
            this.text = text;
            this.correct = correct;
            this.FireEvent('change');
        } else throw result;
    }

    async Remove(){
        let result = await XHR.Request(this.GetApiUrl(), 'DELETE');
        if(result.Status == 204){
            this.FireEvent('remove');
        } else throw result;
    }
}
import Entity from './entity';
import Question from './question';

import * as XHR from '../xhr';

/** Deskryptor odpowiedzi w odpowiedzi z API */
export interface AnswerDescriptor {
    id: number,
    text: string,
    correct: boolean
}

/** @deprecated */
export type AnswerCollection = {
    [answer_id: number]: AnswerDescriptor
}

/** Klasa reprezentująca odpowiedź */
export default class Answer extends Entity {
    /** Unikatowy identyfikator odpowiedzi */
    protected id: number;
    /** Pytanie, do którego odpowiedź należy */
    protected question: Question;
    /** Treść odpowiedzi */
    protected text: string | undefined;
    /** Czy odpowiedź jest poprawna */
    protected correct: boolean | undefined;

    /** Reprezentuje status operacji pobierania danych z serwera */
    private _fetch_awaiter: Promise<void> | undefined;

    /**
     * Klasa reprezentująca odpowiedź
     * @param question Pytanie, do którego odpowiedź należy
     * @param answer Identyfikator odpowiedzi lub deskryptor
     */
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

    /**
     * Zwraca wszystkie odpowiedzi przypisane do pytania
     * @param question Pytanie, do którego odpowiedzi należy zwrócić
     */
    static async GetForQuestion(question: Question){
        let response = await XHR.Request(question.GetApiUrl() + '/answers?depth=3', 'GET');
        let json = response.Response as AnswerCollection;
        let out_array: Answer[] = [];

        Object.keys(json).forEach((question_id) => {
            out_array.push(new Answer(question, json[parseInt(question_id)]));
        });

        return out_array;
    }

    /** Pobiera dane z serwera */
    protected async Fetch(){
        let response = await XHR.Request(this.GetApiUrl() + '?depth=2', 'GET');
        let json = response.Response as AnswerDescriptor;
        this.Populate(json);
    }

    /**
     * Ustawia właściwości zgodnie z danymi w deskryptorze
     * @param descriptor Deskryptor odpowiedzi
     */
    protected Populate(descriptor: AnswerDescriptor){
        this.text = descriptor.text;
        this.correct = descriptor.correct;
    }

    /** Zwraca adres odpowiedzi w API */
    GetApiUrl(){
        return this.question.GetApiUrl() + '/answers/' + this.id;
    }

    /** Zwraca identyfikator odpowiedzi */
    GetId(): number{
        return this.id;
    }

    /** Zwraca treść odpowiedz */
    async GetText(): Promise<string>{
        await this._fetch_awaiter;
        return this.text as string;
    }

    /** Czy odpowiedź jest poprawna */
    async IsCorrect(): Promise<boolean>{
        await this._fetch_awaiter;
        return this.correct as boolean;
    }

    /**
     * Tworzy odpowiedź do pytania
     * @param question Pytanie, do którego zostanie utworzona odpowiedź
     * @param text Treść odpowiedzi
     * @param correct Czy odpowiedź jest poprawna
     */
    static async Create(question: Question, text: string, correct: boolean){
        let request_data = {
            text: text,
            correct: correct
        };
        let result = await XHR.Request(question.GetApiUrl() + '/answers', 'POST', request_data);
        
        if(result.Status != 201) throw result;
    }

    /**
     * Aktualizuje odpowiedź
     * @param text Nowa treść odpowiedzi
     * @param correct Czy odpowiedź jest poprawna
     */
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

    /** Usuwa odpowiedź */
    async Remove(){
        let result = await XHR.Request(this.GetApiUrl(), 'DELETE');
        if(result.Status == 204){
            this.FireEvent('remove');
        } else throw result;
    }
}
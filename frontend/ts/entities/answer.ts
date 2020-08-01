import * as XHR from '../utils/xhr';
import Entity from './entity';
import Question from './question';

/** Klasa reprezentująca odpowiedź */
export default class Answer extends Entity {
    /** Unikatowy identyfikator odpowiedzi */
    public readonly Id: number;
    /** Pytanie, do którego odpowiedź należy */
    public readonly Question: Question;
    /** Treść odpowiedzi */
    protected _Text: string;
    /** Czy odpowiedź jest poprawna */
    protected _Correct: boolean;

    /** Treść odpowiedzi */
    public get Text(){
        return this._Text;
    }
    public set Text(new_value: string){
        this._Text = new_value;
        this.FireEvent('change');
    }

    /** Czy odpowiedź jest poprawna */
    public get Correct(){
        return this._Correct;
    }
    public set Correct(new_value: boolean){
        this._Correct = new_value;
        this.FireEvent('change');
    }

    /**
     * Klasa reprezentująca odpowiedź
     * @param id Identyfikator odpowiedzi
     * @param question Pytanie, do którego należy odpowiedź
     * @param text Treść odpowiedzi
     * @param correct Czy odpowiedź jest prawidłowa
     */
    constructor(id: number, question: Question, text: string, correct: boolean){
        super();

        this.Id = id;
        this.Question = question;
        this._Text = text;
        this._Correct = correct;
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
        let result = await XHR.Request('api/tests/' + question.Test.Id.toString() + '/questions/' + question.Id.toString() + '/answers', 'POST', request_data);
        
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
        let result = await XHR.Request('api/tests/' + this.Question.Test.Id.toString() + '/questions/' + this.Question.Id.toString() + '/answers/' + this.Id.toString(), 'PUT', request_data);
        if(result.Status == 204){
            this.Text = text;
            this.Correct = correct;
            //this.FireEvent('change');
        } else throw result;
    }

    /** Usuwa odpowiedź */
    async Remove(){
        let result = await XHR.Request('api/tests/' + this.Question.Test.Id.toString() + '/questions/' + this.Question.Id.toString() + '/answers/' + this.Id.toString(), 'DELETE');
        if(result.Status == 204){
            this.FireEvent('remove');
        } else throw result;
    }
}
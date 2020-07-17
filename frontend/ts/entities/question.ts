import * as XHR from '../utils/xhr';
import Test from './test';
import Entity from './entity';
import Answer, { AnswerDescriptor, AnswerCollection } from './answer';

/** Deskryptor pytania w odpowiedzi z API */
export interface QuestionDescriptor {
    id: number,
    text: string,
    type: number,
    points: number,
    points_counting: number,
    max_typos: number,
    answer_count: number,
    answers: AnswerCollection
}

/** @deprecated */
export type QuestionCollection = {
    [question_id: number]: QuestionDescriptor
}

/** Klasa reprezentująca pytanie */
export default class Question extends Entity {
    /** Pytanie zamknięte jednokrotnego wyboru */
    public static TYPE_SINGLE_CHOICE = 0;
    /** Pytanie zamknięte wielokrotnego wyboru */
    public static TYPE_MULTI_CHOICE = 1;
    /** Pytanie otwarte */
    public static TYPE_OPEN_ANSWER = 2;

    /** Po ułamku punktu za każdy dobry wybór */
    public static COUNTING_LINEAR = 0;
    /** Punkty tylko za całkowicie dobrą odpowiedź */
    public static COUNTING_BINARY = 1;
    /** Sposób liczenia reprezentujący pytanie otwarte */
    public static COUNTING_OPEN_ANSWER = 2;

    /** Unikatowy identyfikator pytania */
    protected id: number;
    /** Test, do którego pytanie należy */
    protected test: Test;
    /** Treść pytania */
    protected text: string | undefined;
    /** Typ pytania */
    protected type: number | undefined;
    /** Ilość punktów do zdobycia */
    protected points: number | undefined;
    /** Sposób liczenia punktów */
    protected points_counting: number | undefined;
    /** Maksymalna dozwolona liczba literówek */
    protected max_typos: number | undefined;
    /** Ilość odpowiedzi */
    protected answer_count: number | undefined;

    /** Deskryptory odpowiedzi */
    protected answer_descriptors: AnswerDescriptor[] | undefined;
    /** Odpowiedzi do pytania */
    protected answers: Answer[] | undefined;

    /** Reprezentuje trwającą operację pobierania danych */
    private _fetch_awaiter: Promise<void> | undefined;

    /**
     * Klasa reprezentująca pytanie
     * @param test Test, do którego to pytanie należy
     * @param question Identyfikator pytania lub deskryptor
     */
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

    /**
     * Zwraca wszystkie pytania w danym teście
     * @param test Test, dla którego zostaną pobrane pytania
     */
    static async GetForTest(test: Test){
        let response = await XHR.Request(test.GetApiUrl() + '/questions?depth=3', 'GET');
        let json = response.Response as QuestionCollection;
        let out_array: Question[] = [];

        Object.keys(json).forEach((question_id) => {
            out_array.push(new Question(test, json[parseInt(question_id)]));
        });

        return out_array;
    }

    /** Wczytuje to pytanie z serwera */
    protected async Fetch(){
        let response = await XHR.Request(this.GetApiUrl() + '?depth=2', 'GET');
        let json = response.Response as QuestionDescriptor;
        this.Populate(json);
    }

    /**
     * Wypełnia właściwości obiektu na podstawie deskryptora
     * @param descriptor Deskryptor pytania, z którego należy odczytać właściwości
     */
    protected Populate(descriptor: QuestionDescriptor){
        this.text = descriptor.text;
        this.type = descriptor.type;
        this.points = descriptor.points;
        this.points_counting = descriptor.points_counting;
        this.max_typos = descriptor.max_typos;
        this.answer_count = descriptor.answer_count;
        this.answer_descriptors = [];

        if(descriptor.answers !== undefined){
            Object.keys(descriptor.answers).forEach((a_id) => {
                this.answer_descriptors?.push(descriptor.answers[parseInt(a_id)]);
            });
        }
    }

    /** Zwraca adres tego pytania w API */
    GetApiUrl(){
        return this.test.GetApiUrl() + '/questions/' + this.id;
    }

    /** Zwraca identyfikator pytania */
    GetId(): number{
        return this.id;
    }

    /** Zwraca treść pytania */
    async GetText(): Promise<string>{
        await this?._fetch_awaiter;
        return this.text as string;
    }

    /** Zwraca typ pytania */
    async GetType(): Promise<number>{
        await this?._fetch_awaiter;
        return this.type as number;
    }

    /** Zwraca maksymalną ilość punktów do zdobycia */
    async GetPoints(): Promise<number>{
        await this?._fetch_awaiter;
        return this.points as number;
    }

    /** Zwraca sposób liczenia punktów */
    async GetPointsCounting(): Promise<number>{
        await this?._fetch_awaiter;
        return this.points_counting as number;
    }

    /** Zwraca maksymalną dopuszczalną ilość literówek */
    async GetMaxTypos(): Promise<number>{
        await this?._fetch_awaiter;
        return this.max_typos as number;
    }

    /** Zwraca ilość odpowiedzi */
    async GetAnswerCount(): Promise<number>{
        await this?._fetch_awaiter;
        return this.answer_count as number;
    }

    /** Zwraca odpowiedzi do tego pytania */
    async GetAnswers(): Promise<Answer[]>{
        await this?._fetch_awaiter;

        if(this.answers !== undefined) return this.answers;

        let first_answer = (this.answer_descriptors ?? [null])[0];
        if(first_answer === undefined || first_answer === null || Object.keys(first_answer).length == 0){
            this.answers = await Answer.GetForQuestion(this);
        }else{
            this.answers = [];
            this.answer_descriptors?.forEach((descriptor) => {
                this.answers?.push(new Answer(this, descriptor));
            });
        }
        return this.answers;
    }

    /**
     * Tworzy nowe pytanie
     * @param test Test, do którego pytanie ma należeć
     * @param text Treść
     * @param type Typ pytania
     * @param points Liczba punktów do zdobycia
     * @param points_counting Sposób liczenia punktów
     * @param max_typos Maksymalna liczba literówek
     */
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

    /**
     * Aktualizuje pytanie
     * @param text Nowa treść
     * @param type Nowy typ pytania
     * @param points Nowa ilość punktów do zdobycia
     * @param points_counting Nowy sposób liczenia punktów
     * @param max_typos Nowa maksymalna ilość literówek
     */
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

    /** Usuwa pytanie */
    async Remove(){
        let result = await XHR.Request(this.GetApiUrl(), 'DELETE');
        if(result.Status == 204){
            this.FireEvent('remove');
            this.test.OnQuestionRemoved();
        }else throw result;
    }
}
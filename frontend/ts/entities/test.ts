import * as XHR from '../utils/xhr';
import Entity from './entity';
import User from './user';
import PageParams from '../1page/pageparams';

import { UserDescriptor } from './user';
import Question, { QuestionDescriptor, QuestionCollection } from './question';

/** Deskryptor testu w odpowiedzi z API */
export interface TestDescriptor {
    id: number,
    name: string,
    author: UserDescriptor,
    creation_date: string,
    time_limit: number,
    question_multiplier: number,
    question_count: number,
    questions: QuestionCollection,
    assignment_count: number | undefined
}

/** @deprecated - użyć Collection<TestDescriptor> */
type TestCollection = {
    [test_id: number]: TestDescriptor
}

/** Klasa reprezentująca test */
export default class Test extends Entity implements PageParams {
    /** Unikatowy identyfikator testu */
    protected id: number;
    /** Nazwa testu */
    protected name: string | undefined;
    /** Autor testu */
    protected author: User | undefined;
    /** Data utworzenia testu */
    protected creation_date: Date | undefined;
    /** Limit czasu na rozwiązanie testu */
    protected time_limit: number | undefined;
    /** Mnożnik pytań */
    protected question_multiplier: number | undefined;
    /** Ilość pytań (bez uwzględniania mnożnika) */
    protected question_count: number | undefined;
    /** Ile razy test został przypisany */
    protected assignment_count: number | undefined;
    
    /** Deskryptory pytań */
    protected question_descriptors: QuestionDescriptor[] | undefined;
    /** Pytania */
    protected questions: Question[] | undefined;

    /** Reprezentuje status operacji pobierania danych */
    private _fetch_awaiter: Promise<void> | undefined;

    /**
     * Klasa reprezentująca test
     * @param test Identyfikator testu lub deskryptor
     */
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

    /** Zwraca wszystkie testy utworzone przez użytkownika */
    static async GetAll(){
        let response = await XHR.Request('api/tests?depth=3', 'GET');
        let json = response.Response as TestCollection;
        let out_array: Test[] = [];

        Object.keys(json).forEach((test_id) => {
            out_array.push(new Test(json[parseInt(test_id)]));
        });

        return out_array;
    }

    /** Pobiera test z serwera */
    protected async Fetch(){
        let response = await XHR.Request(this.GetApiUrl() + '?depth=2', 'GET');
        let json = response.Response as TestDescriptor;
        this.Populate(json);
    }

    /**
     * Wypełnia właściwości według danych w deskryptorze
     * @param descriptor Deskryptor testu
     */
    protected Populate(descriptor: TestDescriptor){
        this.name = descriptor.name;
        this.author = new User(descriptor.author);
        this.creation_date = new Date(descriptor.creation_date);
        this.time_limit = descriptor.time_limit;
        this.question_multiplier = descriptor.question_multiplier;
        this.question_count = descriptor.question_count;
        this.question_descriptors = [];
        this.assignment_count = descriptor.assignment_count;

        if(descriptor.questions !== undefined){
            Object.keys(descriptor.questions).forEach((q_id) => {
                this.question_descriptors?.push(descriptor.questions[parseInt(q_id)]);
            });
        }
    }

    /** Adres testu w API */
    GetApiUrl(){
        return 'api/tests/' + this.id;
    }

    /** Zwraca identyfikator testu */
    GetId(): number{
        return this.id;
    }

    /** Zwraca nazwę testu */
    async GetName(): Promise<string>{
        await this?._fetch_awaiter;
        return this.name as string;
    }

    /** Zwraca autora testu */
    async GetAuthor(): Promise<User>{
        await this?._fetch_awaiter;
        return this.author as User;
    }

    /** Zwraca datę utworzenia */
    async GetCreationDate(): Promise<Date>{
        await this?._fetch_awaiter;
        return this.creation_date as Date;
    }

    /** Zwraca limit czasu na rozwiązanie */
    async GetTimeLimit(): Promise<number>{
        await this?._fetch_awaiter;
        return this.time_limit as number;
    }

    /** Zwraca mnożnik pytań */
    async GetQuestionMultiplier(): Promise<number>{
        await this?._fetch_awaiter;
        return this.question_multiplier as number;
    }

    /** Zwraca ilość pytań (bez uwzględniania mnożnika) */
    async GetQuestionCount(): Promise<number>{
        await this?._fetch_awaiter;
        return this.question_count as number;
    }

    /** Czy test ma limit czasu na rozwiązanie */
    async HasTimeLimit(): Promise<boolean>{
        return (await this.GetTimeLimit()) != 0;
    }

    /** Ile razy test został przypisany */
    async GetAssignmentCount(): Promise<number | undefined>{
        await this?._fetch_awaiter;
        return this.assignment_count;
    }

    /** Zwraca pytania */
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

    /**
     * Tworzy nowy test
     * @param name Nazwa testu
     * @param question_multiplier Mnożnik pytań
     * @param time_limit Limit czasu na rozwiązanie
     */
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

    /** Usuwa test */
    async Remove(){
        let result = await XHR.Request(this.GetApiUrl(), 'DELETE');
        if(result.Status == 204){
            this.FireEvent('remove');
        }else throw result;
    }

    /**
     * Aktualizuje ustawienia testu
     * @param name Nowa nazwa testu
     * @param question_multiplier Nowa wartość mnożnika pytań
     * @param time_limit Nowy limit czasu na rozwiązanie
     */
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

    /** Zwraca prostą reprezentację obiektu */
    GetSimpleRepresentation(){
        return {
            type: 'test',
            id: this.GetId()
        };
    }

    /** Zapewnia spójność danych po dodaniu pytania */
    OnQuestionAdded(){
        if(this.question_count === undefined) this.question_count = 0;
        this.question_count++;
        this.FireEvent('change');
    }

    /** Zapewnia spójność danych po usunięciu pytania */
    OnQuestionRemoved(){
        if(this.question_count === undefined || this.question_count < 1) return;
        this.question_count--;
        this.FireEvent('change');
    }
}
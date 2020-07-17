import * as XHR from '../utils/xhr';
import Entity, { Collection } from './entity';
import User, { UserDescriptor } from './user';
import Question, { QuestionDescriptor } from './question';
import Assignment from './assignment';
import QuestionWithUserAnswers from './question_with_user_answers';

/** Deskryptor podejścia w odpowiedzi z API */
export interface AttemptDescriptor {
    id: number,
    user: UserDescriptor | undefined,
    score: number | undefined,
    max_score: number,
    begin_time: string | undefined,
    questions: Collection<QuestionDescriptor> | undefined,
    path: number[] | undefined
}

/** Klasa reprezentująca podejście */
export default class Attempt extends Entity {
    /** Unikatowy identyfikator podejścia */
    protected id: number;
    /** Przypisanie, do którego należy to podejście */
    protected assignment: Assignment;
    /** Użytkownik, który wykonał podejście */
    protected user: User | undefined;
    /** Wynik punktowy w podejściu */
    protected score: number | undefined;
    /** Maksymalny wynik punktowy w podejściu */
    protected max_score: number | undefined;
    /** Czas rozpoczęcia podejścia */
    protected begin_time: Date | undefined;
    /** Ścieżka pytań (lista identyfikatorów) */
    protected path: number[] | undefined;

    /** Deskryptory pytań w podejściu */
    protected question_descriptors: Collection<QuestionDescriptor> | undefined;
    /** Pytania w podejściu */
    protected questions: Question[] | undefined;

    /** Reprezentuje status operacji pobierania danych z serwera */
    private _fetch_awaiter: Promise<void> | undefined;

    /**
     * Klasa reprezentująca podejście
     * @param assignment Przypisanie, którego częścią jest podejście
     * @param attempt Identyfikator podejścia lub deskryptor
     */
    constructor(assignment: Assignment, attempt: number | AttemptDescriptor){
        super();

        this.assignment = assignment;
        if(typeof attempt === 'number'){
            this.id = attempt;
            this._fetch_awaiter = this.Fetch();
        }else{
            this.id = attempt.id;
            this.Populate(attempt);
        }
    }

    /** Pobiera podejście */
    protected async Fetch(){
        let response = await XHR.Request(this.GetApiUrl() + '?depth=2', 'GET');
        let json = response.Response as AttemptDescriptor;
        this.Populate(json);
    }

    /** Pobiera wszystkie podejścia dla przypisania */
    static async GetForAssignment(assignment: Assignment){
        let response = await XHR.Request(assignment.GetApiUrl() + '/attempts?depth=2', 'GET');
        let json = response.Response as Collection<AttemptDescriptor>;
        let out_array: Attempt[] = [];

        Object.keys(json).forEach((attempt_id) => {
            out_array.push(new Attempt(assignment, json[parseInt(attempt_id)]));
        });

        return out_array;
    }

    /**
     * Ustawia właściwości podejścia zgodnie z deskryptorem
     * @param descriptor Deskryptor z właściwościami do ustawienia
     */
    protected Populate(descriptor: AttemptDescriptor){
        this.user = descriptor.user === undefined ? undefined : new User(descriptor.user);
        this.score = descriptor.score;
        this.max_score = descriptor.max_score;
        this.begin_time = (descriptor.begin_time === undefined) ? undefined : new Date(descriptor.begin_time);
        this.path = descriptor.path;
        this.question_descriptors = descriptor.questions;
    }

    /** Zwraca adres podejścia w API */
    GetApiUrl(){
        return this.assignment.GetApiUrl() + '/attempts/' + this.id;
    }

    /** Zwraca unikatowy identyfikator podejścia */
    GetId(): number{
        return this.id;
    }

    /** Zwraca przypisanie, do którego należy podejście */
    GetAssignment(): Assignment{
        return this.assignment;
    }

    /** Zwraca użytkownika, który wykonał podejście */
    async GetUser(): Promise<User>{
        await this?._fetch_awaiter;
        return this.user as User;
    }

    /** Zwraca zdobytą liczbę punktów */
    async GetScore(): Promise<number>{
        await this?._fetch_awaiter;
        return this.score as number;
    }

    /** Zwraca maksymalną liczbę punktów, które można było zdobyć */
    async GetMaxScore(): Promise<number>{
        await this?._fetch_awaiter;
        return this.max_score as number;
    }

    /** Zwraca wynik procentowy uzyskany w podejściu */
    async GetPercentageScore(): Promise<number>{
        await this?._fetch_awaiter;

        if(this.score === undefined || this.max_score === undefined) return 0;
        if(this.max_score == 0) return 0;

        return Math.round(100 * this.score / this.max_score);
    }

    /** Zwraca czas rozpoczęcia podejścia */
    async GetBeginTime(): Promise<Date>{
        await this?._fetch_awaiter;
        return this.begin_time as Date;
    }

    /** Zwraca pytania według ścieżki */
    async GetQuestions(): Promise<Question[]>{
        await this?._fetch_awaiter;
        if(this.questions !== undefined) return this.questions;
        if(this.question_descriptors === undefined || this.path === undefined) return [];

        let test = await this.GetAssignment().GetTest();
        let questions: Question[] = [];
        for(const q_id of this.path) {
            if(this.question_descriptors[q_id] === undefined) continue;
            questions.push(new Question(test, this.question_descriptors[q_id]));
        };
        this.questions = questions;

        return questions;
    }

    /**
     * Tworzy nowe podejście
     * @param assignment Przypisanie, do którego należy utworzyć podejście
     */
    static async Create(assignment: Assignment){
        let response = await XHR.Request(assignment.GetApiUrl() + '/attempts?depth=8', 'POST');
        let json = response.Response as AttemptDescriptor;
        return new Attempt(assignment, json);
    }

    /**
     * Zapisuje odpowiedzi użytkownika
     * @param questions Pytania z odpowiedziami
     */
    async SaveUserAnswers(questions: QuestionWithUserAnswers[]){
        let data: SaveUserAnswersPayload = {
            questions: []
        };

        for(let question of questions){
            let answers: {id:number}[] = [];
            let q = {
                id: question.GetQuestion().GetId(),
                done: question.GetIsDone(),
                answers: answers
            };

            let selected_answers = question.GetSelectedAnswers();
            for(let selected_answer of selected_answers){
                q.answers.push({
                    id: selected_answer.GetId()
                });
            }

            data.questions.push(q);
        }

        let response = await XHR.Request(this.GetApiUrl() + '/answers', 'POST', data);

        if(response.Status != 201){
            throw 'Nie udało się zapisać odpowiedzi.';
        }
    }
}

/** Typ reprezentujący treść żądania zapisania odpowiedzi użytkownika */
type SaveUserAnswersPayload = {
    questions: {
        id: number,
        done: boolean,
        answers: {
            id: number
        }[]
    }[]
}
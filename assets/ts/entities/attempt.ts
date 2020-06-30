import * as XHR from '../xhr';
import Entity, { Collection } from './entity';
import User, { UserDescriptor } from './user';
import Question, { QuestionDescriptor } from './question';
import Assignment from './assignment';

export interface AttemptDescriptor {
    id: number,
    user: UserDescriptor | undefined,
    score: number | undefined,
    max_score: number,
    begin_time: string | undefined,
    questions: Collection<QuestionDescriptor> | undefined,
    path: number[] | undefined
}

export default class Attempt extends Entity {
    protected id: number;
    protected assignment: Assignment;
    protected user: User | undefined;
    protected score: number | undefined;
    protected max_score: number | undefined;
    protected begin_time: Date | undefined;
    protected path: number[] | undefined;

    protected question_descriptors: Collection<QuestionDescriptor> | undefined;
    protected questions: Question[] | undefined;

    private _fetch_awaiter: Promise<void> | undefined;

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

    protected async Fetch(){
        let response = await XHR.Request(this.GetApiUrl() + '?depth=2', 'GET');
        let json = response.Response as AttemptDescriptor;
        this.Populate(json);
    }

    protected Populate(descriptor: AttemptDescriptor){
        this.user = descriptor.user === undefined ? undefined : new User(descriptor.user);
        this.score = descriptor.score;
        this.max_score = descriptor.max_score;
        this.begin_time = (descriptor.begin_time === undefined) ? undefined : new Date(descriptor.begin_time);
        this.path = descriptor.path;
        this.question_descriptors = descriptor.questions;
    }

    GetApiUrl(){
        return this.assignment.GetApiUrl() + '/attempts/' + this.id;
    }

    GetId(): number{
        return this.id;
    }

    async GetUser(): Promise<User>{
        await this?._fetch_awaiter;
        return this.user as User;
    }

    async GetScore(): Promise<number>{
        await this?._fetch_awaiter;
        return this.score as number;
    }

    async GetMaxScore(): Promise<number>{
        await this?._fetch_awaiter;
        return this.max_score as number;
    }

    async GetBeginTime(): Promise<Date>{
        await this?._fetch_awaiter;
        return this.begin_time as Date;
    }

    async GetAssignment(): Promise<Assignment>{
        await this?._fetch_awaiter;
        return this.assignment;
    }

    async GetQuestions(): Promise<Question[]>{
        await this?._fetch_awaiter;
        if(this.questions !== undefined) return this.questions;
        if(this.question_descriptors === undefined || this.path === undefined) return [];

        let test = await (await this.GetAssignment()).GetTest();
        let questions: Question[] = [];
        for(const q_id of this.path) {
            questions.push(new Question(test, this.question_descriptors[q_id]));
        };
        // todo
        return questions;
    }
}
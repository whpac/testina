import Entity from './entity';

import * as XHR from '../utils/xhr';
import Test from './test';
import { TestDescriptor } from './test';
import PageParams from '../1page/pageparams';
import Group from './group';
import User, { UserDescriptor } from './user';

import * as DateUtils from '../utils/dateutils';

/** Deskryptor przypisania w odpowiedzi z API */
interface AssignmentDescriptor {
    id: number,
    attempt_limit: number,
    time_limit: string,
    assignment_date: string,
    attempt_count: number,
    score: number | null,
    test: TestDescriptor,
    assigned_by: UserDescriptor
}

/** @deprecated */
type AssignmentCollection = {
    [assignment_id: number]: AssignmentDescriptor
}

type AssignmentTarget = User | Group;

/** Klasa reprezentująca przypisanie */
export default class Assignment extends Entity implements PageParams {
    /** Unikatowy identyfikator przypisania */
    protected id: number;
    /** Limit podejść */
    protected attempt_limit: number | undefined;
    /** Termin na rozwiązanie */
    protected time_limit: Date | undefined;
    /** Data przypisania */
    protected assignment_date: Date | undefined;
    /** Ilość już rozpoczętych podejść */
    protected attempt_count: number | undefined;
    /** Średni wynik procentowy */
    protected score: number | null | undefined;
    /** Test, który przypisano */
    protected test: Test | undefined;
    /** Użytkownik, który przypisał test */
    protected assigned_by: User | undefined;

    /** Reprezentuje status pobierania danych z serwera */
    private _fetch_awaiter: Promise<void> | undefined;

    /**
     * Klasa reprezentująca przypisanie
     * @param assignment Identyfikator przypisania albo deskryptor
     */
    constructor(assignment: number | AssignmentDescriptor){
        super();

        if(typeof assignment === 'number'){
            this.id = assignment;
            this._fetch_awaiter = this.Fetch();
        }else{
            this.id = assignment.id;
            this.Populate(assignment);
        }
    }

    /** Zwraca wszystkie przypisania dla bieżącego użytkownika */
    static async GetAssignedToCurrentUser(){
        let response = await XHR.Request('api/assigned_to_me?depth=4', 'GET');
        let json = response.Response as AssignmentCollection;
        let out_array: Assignment[] = [];

        Object.keys(json).forEach((assignment_id) => {
            out_array.push(new Assignment(json[parseInt(assignment_id)]));
        });

        return out_array;
    }

    /** Wczytuje ponownie przypisanie */
    public Reload(){
        this._fetch_awaiter = this.Fetch();
    }

    /** Wczytuje dane z serwera */
    protected async Fetch(){
        let response = await XHR.Request(this.GetApiUrl() + '?depth=3', 'GET');
        let json = response.Response as AssignmentDescriptor;
        this.Populate(json);
    }

    /**
     * Ustawia właściwości przypisania, korzystając z deskryptora
     * @param descriptor Deskryptor przypisania
     */
    protected Populate(descriptor: AssignmentDescriptor){
        this.attempt_limit = descriptor.attempt_limit;
        this.time_limit = new Date(descriptor.time_limit);
        this.assignment_date = new Date(descriptor.assignment_date);
        this.attempt_count = descriptor.attempt_count;
        this.score = descriptor.score;
        this.test = new Test(descriptor.test);
        this.assigned_by = new User(descriptor.assigned_by);
    }

    /** Zwraca adres przypisania w API */
    GetApiUrl(){
        return 'api/assignments/' + this.id;
    }

    /** Zwraca identyfikator przypisania */
    GetId(): number{
        return this.id;
    }

    /** Zwraca limit podejść */
    async GetAttemptLimit(): Promise<number>{
        await this?._fetch_awaiter;
        return this.attempt_limit as number;
    }

    /** Zwraca termin na rozwiązanie */
    async GetTimeLimit(): Promise<Date>{
        await this?._fetch_awaiter;
        return this.time_limit as Date;
    }

    /** Zwraca datę przypisania */
    async GetAssignmentDate(): Promise<Date>{
        await this?._fetch_awaiter;
        return this.assignment_date as Date;
    }

    /** Zwraca ilość rozpoczętych podejść */
    async GetAttemptCount(): Promise<number>{
        await this?._fetch_awaiter;
        return this.attempt_count as number;
    }

    /** Zwraca średni wynik procentowy */
    async GetScore(): Promise<number | null>{
        await this?._fetch_awaiter;
        return this.score as (number | null);
    }

    /** Zwraca test, który został przypisany */
    async GetTest(): Promise<Test>{
        await this?._fetch_awaiter;
        return this.test as Test;
    }

    async GetAssigningUser(): Promise<User>{
        await this?._fetch_awaiter;
        return this.assigned_by as User;
    }

    /** Czy pozostały jeszcze podejścia */
    async AreRemainingAttempts(): Promise<boolean>{
        let attempt_count = await this.GetAttemptCount();
        let attempt_limit = await this.GetAttemptLimit();
        return (attempt_count < attempt_limit) || await this.AreAttemptsUnlimited();
    }

    /** Czy ilość podejść jest nieograniczona */
    async AreAttemptsUnlimited(): Promise<boolean>{
        return (await this.GetAttemptLimit()) == 0;
    }

    /** Zwraca, ile pozostało podejść */
    async GetRemainingAttemptsCount(): Promise<number>{
        if(await this.AreAttemptsUnlimited()) return Number.POSITIVE_INFINITY;
        return await this.GetAttemptLimit() - await this.GetAttemptCount();
    }

    /** Czy termin na wykonanie minął */
    async HasTimeLimitExceeded(): Promise<boolean>{
        return (await this.GetTimeLimit()) < new Date();
    }

    /** Czy przypisanie jest aktywne (są wolne podejścia i nie upłynął termin) */
    async IsActive(): Promise<boolean>{
        return !(await this.HasTimeLimitExceeded()) && (await this.AreRemainingAttempts());
    }

    GetSimpleRepresentation(){
        return {
            type: 'assignment',
            id: this.GetId()
        };
    }

    static async Create(test: Test, attempt_limit: number, deadline: Date){
        if(attempt_limit == Number.POSITIVE_INFINITY) attempt_limit = 0;

        let payload = {
            test_id: test.GetId(),
            attempt_limit: attempt_limit,
            time_limit: DateUtils.ToLongFormat(deadline)
        }

        let result = await XHR.Request('api/assignments', 'POST', payload);

        if(result.Status != 201) throw result;
        
        return new Assignment(parseInt(result.ContentLocation));
    }

    async AddTargets(targets: AssignmentTarget[]){
        let payload_targets: {type: number, id: number}[] = [];

        for(let target of targets){
            let type = 0;
            if(target instanceof User) type = 0;
            if(target instanceof Group) type = 1;

            payload_targets.push({
                type: type,
                id: target.GetId()
            });
        }

        let payload = {
            targets: payload_targets
        }

        let result = await XHR.Request(this.GetApiUrl(), 'PUT', payload);

        if(result.Status != 204) throw result;
    }
}
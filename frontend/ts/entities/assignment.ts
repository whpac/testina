import Entity from './entity';

import * as XHR from '../utils/xhr';
import Test from './test';
import PageParams from '../1page/pageparams';
import Group from './group';
import User from './user';

import * as DateUtils from '../utils/dateutils';
import AssignmentLoader from './loaders/assignmentloader';
import AttemptLoader from './loaders/attemptloader';
import Attempt from './attempt';

type AssignmentTarget = User | Group;

/** Klasa reprezentująca przypisanie */
export default class Assignment extends Entity implements PageParams {
    /** Unikatowy identyfikator przypisania */
    public readonly Id: number;
    /** Test, który przypisano */
    public readonly Test: Test;
    /** Limit podejść */
    public readonly AttemptLimit: number;
    /** Termin na rozwiązanie */
    public readonly Deadline: Date;
    /** Data przypisania */
    public readonly AssignmentDate: Date;
    /** Ilość już rozpoczętych podejść */
    public readonly AttemptCount: number;
    /** Średni wynik procentowy */
    protected _Score: number | null;
    /** Użytkownik, który przypisał test */
    public readonly AssignedBy: User;

    /** Średni wynik procentowy */
    public get Score(){
        return this._Score;
    }
    public set Score(new_value: number | null){
        this._Score = new_value;
        this.FireEvent('change');
    }

    /** Obiekt ładujący podejścia */
    protected AttemptLoader: AttemptLoader;

    /**
     * Klasa reprezentująca przypisanie
     * @param id Identyfikator przypisania
     * @param test Test, który został przypisany
     * @param attempt_limit Limit podejść
     * @param deadline Termin na rozwiązanie
     * @param assignment_date Data przypisania
     * @param attempt_loader Obiekt ładujący podejścia
     * @param score Średni wynik (lub null, jeśli nie było podejść)
     * @param assigned_by Osoba przypisująca
     */
    constructor(id: number, test: Test, attempt_limit: number, deadline: Date, assignment_date: Date,
        attempt_loader: AttemptLoader, score: number | null, assigned_by: User){
        
        super();

        if(attempt_loader.AttemptCount === undefined) throw 'AttemptLoader.AttemptCount nie może być undefined.';

        this.Id = id;
        this.Test = test;
        this.AttemptLimit = attempt_limit;
        this.Deadline = deadline;
        this.AssignmentDate = assignment_date;
        this.AttemptCount = attempt_loader.AttemptCount;
        this._Score = score;
        this.AssignedBy = assigned_by;

        this.AttemptLoader = attempt_loader;
    }

    protected _Attempts: Attempt[] | undefined;
    /** Zwraca pytania do tego testu */
    public async GetAttempts(){
        if(this._Attempts === undefined){
            this._Attempts = await this.AttemptLoader.GetAllForAssignment();
        }
        return this._Attempts;
    }

    /** Czy pozostały jeszcze podejścia */
    AreRemainingAttempts(){
        return (this.AttemptCount < this.AttemptLimit) || this.AreAttemptsUnlimited();
    }

    /** Czy ilość podejść jest nieograniczona */
    AreAttemptsUnlimited(){
        return this.AttemptLimit == 0;
    }

    /** Zwraca, ile pozostało podejść */
    GetRemainingAttemptsCount(){
        if(this.AreAttemptsUnlimited()) return Number.POSITIVE_INFINITY;
        return this.AttemptLimit - this.AttemptCount;
    }

    /** Czy termin na wykonanie minął */
    HasDeadlineExceeded(){
        return this.Deadline < new Date();
    }

    /** Czy przypisanie jest aktywne (są wolne podejścia i nie upłynął termin) */
    IsActive(){
        return !this.HasDeadlineExceeded() && this.AreRemainingAttempts();
    }

    GetSimpleRepresentation(){
        return {
            type: 'assignment',
            id: this.Id
        };
    }

    static async Create(test: Test, attempt_limit: number, deadline: Date){
        if(attempt_limit == Number.POSITIVE_INFINITY) attempt_limit = 0;

        let payload = {
            test_id: test.Id,
            attempt_limit: attempt_limit,
            time_limit: DateUtils.ToLongFormat(deadline)
        }

        let result = await XHR.Request('api/assignments', 'POST', payload);

        if(result.Status != 201) throw result;
        
        return AssignmentLoader.LoadById(parseInt(result.ContentLocation));
    }

    async AddTargets(targets: AssignmentTarget[]){
        let payload_targets: {type: number, id: number}[] = [];

        for(let target of targets){
            let type = 0;
            if(target instanceof User) type = 0;
            if(target instanceof Group) type = 1;

            payload_targets.push({
                type: type,
                id: target.Id
            });
        }

        let payload = {
            targets: payload_targets
        }

        let result = await XHR.Request('api/assignments/' + this.Id, 'PUT', payload);

        if(result.Status != 204) throw result;
    }
}
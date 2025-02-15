import Entity from './entity';

import XHR from '../network/xhr';
import Test from './test';
import PageParams from '../1page/page_params';
import Group from './group';
import User from './user';

import * as DateUtils from '../utils/dateutils';
import AssignmentLoader from './loaders/assignmentloader';
import AttemptLoader from './loaders/attemptloader';
import Attempt from './attempt';
import AssignmentTargetsLoader from './loaders/assignmenttargetsloader';
import AssignmentResultsLoader from './loaders/assignmentresultsloader';
import { StringKeyedCollection } from './question_with_user_answers';
import UserLoader from './loaders/userloader';

type AssignmentTargetEntity = User | Group | string;
export type AssignmentTargets = {
    Groups: Group[];
    Users: User[];
    AllUsers: User[];
    LinkIds: string[];
};

export type AssignmentResult = {
    User: User,
    AttemptCount: number,
    LastAttempt: Date | undefined,
    AverageScore: number | undefined;
};

/** Klasa reprezentująca przypisanie */
export default class Assignment extends Entity implements PageParams {
    /** Unikatowy identyfikator przypisania */
    public readonly Id: number | string;
    /** Test, który przypisano */
    public readonly Test: Test;
    /** Limit podejść */
    protected _AttemptLimit: number;
    /** Termin na rozwiązanie */
    protected _Deadline: Date;
    /** Data przypisania */
    public readonly AssignmentDate: Date;
    /** Ilość już rozpoczętych podejść */
    public readonly AttemptCount: number;
    /** Średni wynik procentowy */
    protected _Score: number | null;
    /** Użytkownik, który przypisał test */
    public readonly AssignedBy: User;
    /** Wyniki poszczególnych użytkowników */
    protected readonly Scores: StringKeyedCollection<number> | null;

    /** Limit podejść */
    public get AttemptLimit() {
        return this._AttemptLimit;
    }
    /** Termin na rozwiązanie */
    public get Deadline() {
        return this._Deadline;
    }

    /** Średni wynik procentowy */
    public get Score() {
        return this._Score ?? undefined;
    }
    public set Score(new_value: number | undefined) {
        this._Score = new_value ?? null;
        this.FireEvent('change');
    }

    /** Obiekt ładujący podejścia */
    protected AttemptLoader: AttemptLoader;
    /** Obiekt ładujący cele */
    protected TargetsLoader: AssignmentTargetsLoader;
    /** Obiekt ładujący wyniki innych osób */
    protected ResultsLoader: AssignmentResultsLoader;

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
     * @param targets_loader Obiekt wczytujący cele przypisań
     * @param results_loader Obiekt wczytujący wyniki
     * @param scores Wyniki poszczególnych osób
     */
    constructor(id: number | string, test: Test, attempt_limit: number, deadline: Date, assignment_date: Date,
        attempt_loader: AttemptLoader, score: number | null, assigned_by: User,
        targets_loader: AssignmentTargetsLoader, results_loader: AssignmentResultsLoader,
        scores: StringKeyedCollection<number> | null) {

        super();

        if(attempt_loader.AttemptCount === undefined) throw 'AttemptLoader.AttemptCount nie może być undefined.';

        this.Id = id;
        this.Test = test;
        this._AttemptLimit = attempt_limit;
        this._Deadline = deadline;
        this.AssignmentDate = assignment_date;
        this.AttemptCount = attempt_loader.AttemptCount;
        this._Score = score;
        this.AssignedBy = assigned_by;

        this.AttemptLoader = attempt_loader;
        this.TargetsLoader = targets_loader;
        this.ResultsLoader = results_loader;
        this.Scores = scores;
    }

    protected _Attempts: Attempt[] | undefined;
    /** Zwraca podejścia użytkownika do tego przypisania */
    public async GetAttemptsForUser(user: User) {
        if(this._Attempts === undefined) {
            this._Attempts = await this.AttemptLoader.GetAllForAssignment();
        }
        return this._Attempts.filter((a) => a.User.Id == user.Id);
    }

    /** Zwraca podejścia bieżącego użytkownika do tego przypisania */
    public async GetAttemptsForCurrentUser() {
        let current_user = await UserLoader.GetCurrent();
        if(current_user === undefined) return [];

        return this.GetAttemptsForUser(current_user);
    }

    protected _Targets: AssignmentTargets | undefined;
    /** Zwraca cele przypisania */
    public async GetTargets() {
        if(this._Targets === undefined) {
            this._Targets = await this.TargetsLoader.Load();
        }
        return this._Targets;
    }

    protected _Results: StringKeyedCollection<AssignmentResult> | undefined;
    /** Zwraca wyniki innych osób, indeksowane id użytkownika */
    public async GetResults() {
        if(this._Results === undefined) {
            let results = await this.ResultsLoader.Load();
            this._Results = {};
            for(let result of results) {
                this._Results[result.User.Id] = result;
            }
        }
        return this._Results;
    }

    public InvalidateResults() {
        this._Results = undefined;
        this.ResultsLoader.SaveDescriptors(undefined);
    }

    public GetScoreForUser(user: User) {
        if(this.Scores === null) return null;
        if(this._Results !== undefined) {
            if(this._Results[user.Id] !== undefined) return this._Results[user.Id].AverageScore;
        }
        if(this.Scores[user.Id] !== undefined) return this.Scores[user.Id];
        return null;
    }

    /** Czy pozostały jeszcze podejścia */
    AreRemainingAttempts() {
        return ((this.AttemptCount < this.AttemptLimit) || this.AreAttemptsUnlimited()) && !this.Test.IsDeleted;
    }

    /** Czy ilość podejść jest nieograniczona */
    AreAttemptsUnlimited() {
        return this.AttemptLimit == 0;
    }

    /** Zwraca, ile pozostało podejść */
    GetRemainingAttemptsCount() {
        if(this.AreAttemptsUnlimited()) return Number.POSITIVE_INFINITY;
        return this.AttemptLimit - this.AttemptCount;
    }

    /** Czy termin na wykonanie minął */
    HasDeadlineExceeded() {
        return this._Deadline < new Date();
    }

    /** Czy przypisanie jest aktywne (są wolne podejścia i nie upłynął termin) */
    IsActive() {
        return !this.HasDeadlineExceeded() && this.AreRemainingAttempts();
    }

    /**
     * Zwraca ilość podejść, które użytkownik wykonał
     * @param user Użytkownik, któremu policzyć podejścia
     */
    async CountUsersAttempts(user: User): Promise<number> {
        let results = await this.GetResults();
        return results[user.Id]?.AttemptCount ?? 0;
    }

    /**
     * Zwraca całkowitą ilość podejść, wykonanych przez wszystkich użytkowników
     */
    async CountAllAttempts(): Promise<number> {
        let results = await this.GetResults();
        let total_attempts = 0;
        for(let user_id in results) {
            total_attempts += results[user_id].AttemptCount;
        }
        return total_attempts;
    }

    GetSimpleRepresentation() {
        return {
            type: 'assignment',
            id: this.Id
        };
    }

    static async Create(test: Test, attempt_limit: number, deadline: Date) {
        if(attempt_limit == Number.POSITIVE_INFINITY) attempt_limit = 0;

        let payload = {
            test_id: test.Id,
            attempt_limit: attempt_limit,
            time_limit: DateUtils.ToLongFormat(deadline)
        };

        let result = await XHR.PerformRequest('api/assignments', 'POST', payload);

        if(result.Status != 201) throw result;

        let assignment = await AssignmentLoader.LoadById(parseInt(result.ContentLocation));
        test.AddAssignment(assignment);
        return assignment;
    }

    async Update(attempt_limit: number, deadline: Date) {
        if(attempt_limit == Number.POSITIVE_INFINITY) attempt_limit = 0;

        let payload = {
            attempt_limit: attempt_limit,
            time_limit: DateUtils.ToLongFormat(deadline)
        };

        let result = await XHR.PerformRequest('api/assignments/' + this.Id.toString(), 'PUT', payload);

        if(result.Status != 204) throw result;

        this._AttemptLimit = attempt_limit;
        this._Deadline = deadline;
        this.FireEvent('change');
    }

    async AddTargets(targets: AssignmentTargetEntity[], fire_event: boolean = true) {
        let payload_targets: { type: number, id: string; }[] = [];

        for(let target of targets) {
            let type = -1;
            let id = '0';
            if(target instanceof User) type = 0;
            if(target instanceof Group) type = 1;

            if(typeof target == 'string') {
                type = 2;
            } else {
                id = target.Id;
            }

            payload_targets.push({
                type: type,
                id: id
            });
        }

        let payload = {
            targets: payload_targets
        };

        let result = await XHR.PerformRequest('api/assignments/' + this.Id.toString() + '/targets', 'POST', payload);

        if(result.Status != 201) throw result;

        this._Targets = undefined;
        this.TargetsLoader.SaveDescriptor(undefined);
        if(fire_event) this.FireEvent('change');
    }

    async RemoveTargets(targets: AssignmentTargetEntity[], fire_event: boolean = true) {
        let payload_targets: { type: number, id: string; }[] = [];

        for(let target of targets) {
            let type = -1;
            let id = '0';
            if(target instanceof User) type = 0;
            if(target instanceof Group) type = 1;

            if(typeof target == 'string') {
                type = 2;
                id = target;
            } else {
                id = target.Id;
            }

            payload_targets.push({
                type: type,
                id: id
            });
        }

        let payload = {
            targets: payload_targets
        };

        let result = await XHR.PerformRequest('api/assignments/' + this.Id.toString() + '/targets', 'DELETE', payload);

        if(result.Status != 204) throw result;

        this._Targets = undefined;
        this.TargetsLoader.SaveDescriptor(undefined);
        if(fire_event) this.FireEvent('change');
    }
}
import Entity from './entity';

import * as XHR from '../xhr';
import Test from './test';
import { TestDescriptor } from './test';

interface AssignmentDescriptor {
    id: number,
    attempt_limit: number,
    time_limit: string,
    assignment_date: string,
    attempt_count: number,
    score: number | null,
    test: TestDescriptor
}

type AssignmentCollection = {
    [assignment_id: number]: AssignmentDescriptor
}

export default class Assignment extends Entity {
    protected id: number;
    protected attempt_limit: number | undefined;
    protected time_limit: Date | undefined;
    protected assignment_date: Date | undefined;
    protected attempt_count: number | undefined;
    protected score: number | null | undefined;
    protected test: Test | undefined;

    private _fetch_awaiter: Promise<void> | undefined;

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

    static async GetAll(){
        let response = await XHR.Request('api/assignments?depth=4', 'GET');
        let json = response.Response as AssignmentCollection;
        let out_array: Assignment[] = [];

        Object.keys(json).forEach((assignment_id) => {
            out_array.push(new Assignment(json[parseInt(assignment_id)]));
        });

        return out_array;
    }

    protected async Fetch(){
        let response = await XHR.Request(this.GetApiUrl() + '?depth=3', 'GET');
        let json = response.Response as AssignmentDescriptor;
        this.Populate(json);
    }

    protected Populate(descriptor: AssignmentDescriptor){
        this.attempt_limit = descriptor.attempt_limit;
        this.time_limit = new Date(descriptor.time_limit);
        this.assignment_date = new Date(descriptor.assignment_date);
        this.attempt_count = descriptor.attempt_count;
        this.score = descriptor.score;
        this.test = new Test(descriptor.test);
    }

    GetApiUrl(){
        return 'api/assignments/' + this.id;
    }

    GetId(): number{
        return this.id;
    }

    async GetAttemptLimit(): Promise<number>{
        await this?._fetch_awaiter;
        return this.attempt_limit as number;
    }

    async GetTimeLimit(): Promise<Date>{
        await this?._fetch_awaiter;
        return this.time_limit as Date;
    }

    async GetAssignmentDate(): Promise<Date>{
        await this?._fetch_awaiter;
        return this.assignment_date as Date;
    }

    async GetAttemptCount(): Promise<number>{
        await this?._fetch_awaiter;
        return this.attempt_count as number;
    }

    async GetScore(): Promise<number | null>{
        await this?._fetch_awaiter;
        return this.score as (number | null);
    }

    async GetTest(): Promise<Test>{
        await this?._fetch_awaiter;
        return this.test as Test;
    }
}
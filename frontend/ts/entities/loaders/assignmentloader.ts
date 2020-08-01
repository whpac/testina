import * as XHR from '../../utils/xhr';
import TestLoader, { TestDescriptor } from './testloader';
import UserLoader, { UserDescriptor } from './userloader';
import Assignment from '../assignment';
import { Collection } from '../entity';
import Test from '../test';
import AttemptLoader, { AttemptDescriptor } from './attemptloader';
import ApiEndpoints from './apiendpoints';

/** Deskryptor przypisania w odpowiedzi z API */
export interface AssignmentDescriptor {
    id: number,
    attempt_limit: number,
    time_limit: string,
    assignment_date: string,
    attempt_count: number,
    score: number | null,
    test: TestDescriptor,
    assigned_by: UserDescriptor,
    attempts: Collection<AttemptDescriptor>
}

export default class AssignmentLoader {
    public readonly AssignmentCount: number | undefined;
    protected Test: Test | undefined;
    protected AssignmentDescriptors: Collection<AssignmentDescriptor> | undefined;

    constructor(question_count?: number){
        this.AssignmentCount = question_count;
    }

    /**
     * Ustawia test, dla którego będą ładowane przypisania
     * @param test Test, dla którego będą ładowane przypisania
     */
    public SetTest(test: Test){
        this.Test = test;
    }

    /**
     * Zapisuje deskryptory przypisań do późniejszego wykorzystania
     * @param assignment_descriptors Deskryptory przypisań
     */
    public SaveDescriptors(assignment_descriptors: Collection<AssignmentDescriptor>){
        this.AssignmentDescriptors = assignment_descriptors;
    }

    /**
     * Zwraca wszystkie przypisania dla bieżącego testu
     */
    public async GetAll(){
        if(this.Test === undefined) throw 'AssignmentLoader.Test nie może być undefined.';

        let descriptors;
        if(this.AssignmentDescriptors === undefined){
            let response = await XHR.Request(ApiEndpoints.GetEntityUrl(this.Test) + '/assignments?depth=4', 'GET');
            descriptors = response.Response as Collection<AssignmentDescriptor>;
        }else{
            descriptors = this.AssignmentDescriptors;
        }

        let assignments: Assignment[] = [];
        for(let assignment_id of Object.keys(descriptors)) {
            assignments.push(AssignmentLoader.CreateFromDescriptor(descriptors[parseInt(assignment_id)]));
        }
        return assignments;
    }

    /**
     * Wczytuje przypisanie o podanym identyfikatorze
     * @param assignment_id Identyfikator przypisania
     */
    public static async LoadById(assignment_id: number){
        let response = await XHR.Request('api/assignments/' + assignment_id.toString() + '?depth=3', 'GET');
        let json = response.Response as AssignmentDescriptor;
        return this.CreateFromDescriptor(json);
    }

    /**
     * Tworzy przypisanie na podstawie deskryptora
     * @param assignment_descriptor Deskryptor przypisania
     */
    public static CreateFromDescriptor(assignment_descriptor: AssignmentDescriptor){
        let attempt_loader = new AttemptLoader(assignment_descriptor.attempt_count);

        let assignment = new Assignment(
            assignment_descriptor.id,
            TestLoader.CreateFromDescriptor(assignment_descriptor.test),
            assignment_descriptor.attempt_limit,
            new Date(assignment_descriptor.time_limit),
            new Date(assignment_descriptor.assignment_date),
            attempt_loader,
            assignment_descriptor.score,
            UserLoader.CreateFromDescriptor(assignment_descriptor.assigned_by)
        );

        attempt_loader.SetAssignment(assignment);
        if(!Collection.IsEmpty(assignment_descriptor.attempts))
            attempt_loader.SaveDescriptors(assignment_descriptor.attempts);

        return assignment;
    }

    /**
     * Wczytuje wszystkie przypisania dla bieżącego użytkownika
     */
    public static async GetAssignedToCurrentUser(){
        let response = await XHR.Request('api/assigned_to_me?depth=4', 'GET');
        let json = response.Response as Collection<AssignmentDescriptor>;
        let out_array: Assignment[] = [];

        Object.keys(json).forEach((assignment_id) => {
            out_array.push(this.CreateFromDescriptor(json[parseInt(assignment_id)]));
        });

        return out_array;
    }
}
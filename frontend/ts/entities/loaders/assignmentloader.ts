import * as XHR from '../../utils/xhr';
import TestLoader, { TestDescriptor } from './testloader';
import UserLoader from './userloader';
import Assignment from '../assignment';
import { Collection } from '../entity';
import Test from '../test';
import AttemptLoader, { AttemptDescriptor } from './attemptloader';
import ApiEndpoints from './apiendpoints';
import AssignmentTargetsLoader, { AssignmentTargetsDescriptor } from './assignmenttargetsloader';
import Loader from './loader';

/** Deskryptor przypisania w odpowiedzi z API */
export interface AssignmentDescriptor {
    id: number,
    attempt_limit: number,
    time_limit: string,
    assignment_date: string,
    score_current: number | null,
    test: TestDescriptor,
    assigned_by_id: number,
    attempt_count: number,
    attempts: Collection<AttemptDescriptor>,
    target_count: number | undefined,
    targets: AssignmentTargetsDescriptor | undefined
}

export default class AssignmentLoader implements Loader<Assignment> {
    public readonly AssignmentCount: number | undefined;
    protected Test: Test | undefined;
    protected AssignmentDescriptors: Collection<AssignmentDescriptor> | undefined;

    constructor(question_count?: number){
        this.AssignmentCount = question_count;
    }

    LoadById(entity_id: number): Promise<Assignment>;
    LoadById(entity_ids: number[]): Promise<Assignment[]>;
    public async LoadById(assignment_id: number | number[]): Promise<Assignment | Assignment[]>{
        if(typeof assignment_id == 'number'){
            let response = await XHR.Request('api/assignments/' + assignment_id.toString() + '?depth=3', 'GET');
            let descriptor = response.Response as AssignmentDescriptor;
            return AssignmentLoader.CreateFromDescriptor(descriptor);
        }else{
            let assignments: Assignment[] = [];
            for(let id of assignment_id){
                let response = await XHR.Request('api/assignments/' + id.toString() + '?depth=3', 'GET');
                let descriptor = response.Response as AssignmentDescriptor;
                assignments.push(await AssignmentLoader.CreateFromDescriptor(descriptor));
            }
            return assignments;
        }
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
        for(let assignment_id in descriptors) {
            assignments.push(await AssignmentLoader.CreateFromDescriptor(descriptors[parseInt(assignment_id)]));
        }
        return assignments;
    }

    /**
     * Wczytuje przypisanie o podanym identyfikatorze
     * @param assignment_id Identyfikator przypisania
     */
    public static async LoadById(assignment_id: number){
        return new AssignmentLoader().LoadById(assignment_id);
    }

    /**
     * Tworzy przypisanie na podstawie deskryptora
     * @param assignment_descriptor Deskryptor przypisania
     */
    public static async CreateFromDescriptor(assignment_descriptor: AssignmentDescriptor){
        let attempt_loader = new AttemptLoader(assignment_descriptor.attempt_count);
        let targets_loader = new AssignmentTargetsLoader(assignment_descriptor.target_count);

        let assignment = new Assignment(
            assignment_descriptor.id,
            await TestLoader.CreateFromDescriptor(assignment_descriptor.test),
            assignment_descriptor.attempt_limit,
            new Date(assignment_descriptor.time_limit),
            new Date(assignment_descriptor.assignment_date),
            attempt_loader,
            assignment_descriptor.score_current,
            await UserLoader.LoadById(assignment_descriptor.assigned_by_id),
            targets_loader
        );

        attempt_loader.SetAssignment(assignment);
        if(!Collection.IsEmpty(assignment_descriptor.attempts))
            attempt_loader.SaveDescriptors(assignment_descriptor.attempts);

        targets_loader.SetAssignment(assignment);
        if(assignment_descriptor.targets !== undefined)
            targets_loader.SaveDescriptor(assignment_descriptor.targets);

        return assignment;
    }

    /**
     * Wczytuje wszystkie przypisania dla bieżącego użytkownika
     */
    public static async GetAssignedToCurrentUser(){
        let response = await XHR.Request('api/assignments?depth=4&filter=to_me', 'GET');
        let descriptors = response.Response as Collection<AssignmentDescriptor>;
        let out_array: Assignment[] = [];

        for(let assignment_id in descriptors){
            out_array.push(await this.CreateFromDescriptor(descriptors[parseInt(assignment_id)]));
        }

        return out_array;
    }
}
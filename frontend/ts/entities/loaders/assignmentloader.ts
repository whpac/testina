import XHR from '../../network/xhr';
import TestLoader, { TestDescriptor } from './testloader';
import UserLoader from './userloader';
import Assignment from '../assignment';
import { Collection } from '../entity';
import Test from '../test';
import AttemptLoader, { AttemptDescriptor } from './attemptloader';
import ApiEndpoints from './apiendpoints';
import AssignmentTargetsLoader, { AssignmentTargetsDescriptor } from './assignmenttargetsloader';
import Loader from './loader';
import AssignmentResultsLoader, { AssignmentResultsDescriptor } from './assignmentresultsloader';
import User from '../user';
import AuthManager from '../../auth/auth_manager';
import { StringKeyedCollection } from '../question_with_user_answers';

/** Deskryptor przypisania w odpowiedzi z API */
export interface AssignmentDescriptor {
    id: number,
    attempt_limit: number,
    time_limit: string,
    assignment_date: string,
    score_current: number | null,
    scores: StringKeyedCollection<number> | null,
    test: TestDescriptor,
    assigned_by_id: string,
    attempt_count: number,
    attempts: Collection<AttemptDescriptor>,
    targets: AssignmentTargetsDescriptor | undefined,
    results: AssignmentResultsDescriptor[] | undefined;
}

export default class AssignmentLoader implements Loader<Assignment> {
    public readonly AssignmentCount: number | undefined;
    protected Test: Test | undefined;
    protected AssignmentDescriptors: Collection<AssignmentDescriptor> | undefined;

    constructor(question_count?: number) {
        this.AssignmentCount = question_count;
    }

    LoadById(entity_id: number | string): Promise<Assignment>;
    LoadById(entity_ids: number[] | string[]): Promise<Assignment[]>;
    public async LoadById(assignment_id: number | string | number[] | string[]): Promise<Assignment | Assignment[]> {
        if(typeof assignment_id == 'number' || typeof assignment_id == 'string') {
            let response = await XHR.PerformRequest('api/assignments/' + assignment_id.toString() + '?depth=3', 'GET', undefined, true);
            let descriptor = response.Response as AssignmentDescriptor;
            return AssignmentLoader.CreateFromDescriptor(descriptor, assignment_id);
        } else {
            let assignments: Assignment[] = [];
            for(let id of assignment_id) {
                let response = await XHR.PerformRequest('api/assignments/' + id.toString() + '?depth=3', 'GET');
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
    public SetTest(test: Test) {
        this.Test = test;
    }

    /**
     * Zapisuje deskryptory przypisań do późniejszego wykorzystania
     * @param assignment_descriptors Deskryptory przypisań
     */
    public SaveDescriptors(assignment_descriptors: Collection<AssignmentDescriptor>) {
        this.AssignmentDescriptors = assignment_descriptors;
    }

    /**
     * Zwraca wszystkie przypisania dla bieżącego testu
     */
    public async GetAll() {
        if(this.Test === undefined) throw 'AssignmentLoader.Test nie może być undefined.';

        let descriptors;
        if(this.AssignmentDescriptors === undefined) {
            let response = await XHR.PerformRequest(ApiEndpoints.GetEntityUrl(this.Test) + '/assignments?depth=4', 'GET');
            descriptors = response.Response as Collection<AssignmentDescriptor>;
        } else {
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
    public static async LoadById(assignment_id: number | string) {
        return new AssignmentLoader().LoadById(assignment_id);
    }

    /**
     * Tworzy przypisanie na podstawie deskryptora
     * @param assignment_descriptor Deskryptor przypisania
     */
    public static async CreateFromDescriptor(assignment_descriptor: AssignmentDescriptor, alt_id?: number | string) {
        let attempt_loader = new AttemptLoader(assignment_descriptor.attempt_count);
        let targets_loader = new AssignmentTargetsLoader();
        let results_loader = new AssignmentResultsLoader();

        let assigning_user;
        try {
            assigning_user = await UserLoader.LoadById(assignment_descriptor.assigned_by_id);
        } catch(e) {
            if(await AuthManager.IsAuthorized()) throw e;
            assigning_user = new User('0', 'Nieznany', 'użytkownik', false);
        }

        let assignment = new Assignment(
            alt_id ?? assignment_descriptor.id,
            await TestLoader.CreateFromDescriptor(assignment_descriptor.test),
            assignment_descriptor.attempt_limit,
            new Date(assignment_descriptor.time_limit),
            new Date(assignment_descriptor.assignment_date),
            attempt_loader,
            assignment_descriptor.score_current,
            assigning_user,
            targets_loader,
            results_loader,
            assignment_descriptor.scores
        );

        attempt_loader.SetAssignment(assignment);
        if(!Collection.IsEmpty(assignment_descriptor.attempts))
            attempt_loader.SaveDescriptors(assignment_descriptor.attempts);

        targets_loader.SetAssignment(assignment);
        if(assignment_descriptor.targets !== undefined)
            targets_loader.SaveDescriptor(assignment_descriptor.targets);

        results_loader.SetAssignment(assignment);
        if(assignment_descriptor.results !== undefined)
            results_loader.SaveDescriptors(assignment_descriptor.results);

        return assignment;
    }

    /**
     * Wczytuje wszystkie przypisania dla bieżącego użytkownika
     */
    public static async GetAssignedToCurrentUser(filter: '' | 'surveys_only' | 'tests_only' = '') {
        let filter_str: string = filter;
        if(filter != '') filter_str = ',' + filter_str;

        let response = await XHR.PerformRequest('api/assignments?depth=4&filter=to_me' + filter_str, 'GET');
        let descriptors = response.Response as Collection<AssignmentDescriptor>;
        let out_array: Assignment[] = [];

        for(let assignment_id in descriptors) {
            out_array.push(await this.CreateFromDescriptor(descriptors[parseInt(assignment_id)]));
        }

        return out_array;
    }
}
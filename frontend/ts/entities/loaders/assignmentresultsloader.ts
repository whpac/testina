import * as XHR from '../../utils/xhr';
import UserLoader from './userloader';
import Assignment, { AssignmentTargets, AssignmentResult } from '../assignment';
import ApiEndpoints from './apiendpoints';

/** Deskryptor wyników w odpowiedzi z API */
export interface AssignmentResultsDescriptor {
    user_id: number,
    attempt_count: number,
    last_attempt: string | null,
    average_score: number | null
}

export default class AssignmentResultsLoader {
    protected Assignment: Assignment | undefined;
    protected ResultDescriptors: AssignmentResultsDescriptor[] | undefined;

    /**
     * Ustawia przypisanie, dla którego będą wczytywane wyniki
     * @param assignment Przypisanie, dla którego będą wczytywane wyniki
     */
    public SetAssignment(assignment: Assignment){
        this.Assignment = assignment;
    }

    /**
     * Zapisuje deskryptory wyników do późniejszego wykorzystania
     * @param target_descriptors Deskryptory wyników
     */
    public SaveDescriptors(target_descriptors: AssignmentResultsDescriptor[]){
        this.ResultDescriptors = target_descriptors;
    }

    /**
     * Wczytuje wyniki dla bieżącego przypisania
     */
    public async Load(){
        if(this.Assignment === undefined) throw 'AssignmentResultsLoader.Assignment nie może być undefined.';

        let descriptors: AssignmentResultsDescriptor[];
        if(this.ResultDescriptors !== undefined){
            descriptors = this.ResultDescriptors;
        }else{
            let response = await XHR.Request(ApiEndpoints.GetEntityUrl(this.Assignment) + '/results?depth=2', 'GET');
            descriptors = response.Response as AssignmentResultsDescriptor[];
        }

        let results: AssignmentResult[] = [];
        for(let descriptor of descriptors){
            results.push(await this.CreateFromDescriptor(descriptor));
        }

        return results;
    }

    /**
     * Tworzy wyniki na podstawie deskryptora
     * @param results_descriptor Deskryptor wyników
     */
    public async CreateFromDescriptor(results_descriptor: AssignmentResultsDescriptor): Promise<AssignmentResult>{
        if(this.Assignment === undefined) throw 'AssignmentResultsLoader.Assignment nie może być undefined.';

        let user_loader = new UserLoader();
        let user_awaiter = user_loader.LoadById(results_descriptor.user_id);

        return {
            User: await user_awaiter,
            AttemptCount: results_descriptor.attempt_count,
            LastAttempt: results_descriptor.last_attempt !== null ? new Date(results_descriptor.last_attempt) : undefined,
            AverageScore: results_descriptor.average_score ?? undefined
        }
    }
}
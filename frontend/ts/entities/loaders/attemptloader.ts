import * as XHR from '../../utils/xhr';
import UserLoader from './userloader';
import { Collection } from '../entity';
import QuestionLoader, { QuestionDescriptor } from './questionloader';
import Attempt from '../attempt';
import Assignment from '../assignment';
import ApiEndpoints from './apiendpoints';

/** Deskryptor podejścia w odpowiedzi z API */
export interface AttemptDescriptor {
    id: number,
    user_id: number,
    score: number | undefined,
    max_score: number,
    begin_time: string,
    questions: Collection<QuestionDescriptor> | undefined,
    path: number[] | undefined
}

export default class AttemptLoader {
    public readonly AttemptCount: number | undefined;
    protected Assignment: Assignment | undefined;
    protected AttemptDescriptors: Collection<AttemptDescriptor> | undefined;

    constructor(attempt_count?: number){
        this.AttemptCount = attempt_count;
    }

    /**
     * Tworzy podejście na podstawie deskryptora
     * @param assignment Przypisanie, do którego należy podejście
     * @param descriptor Deskryptor podejścia
     */
    public static CreateFromDescriptor(assignment: Assignment, descriptor: AttemptDescriptor){
        let loader = new AttemptLoader();
        loader.SetAssignment(assignment);
        return loader.CreateFromDescriptor(descriptor);
    }

    /**
     * Ustawia przypisanie, dla którego będą wczytywane podejścia
     * @param assignment Przypisanie, dla którego będą wczytywane podejścia
     */
    public SetAssignment(assignment: Assignment){
        this.Assignment = assignment;
    }

    /**
     * Zapisuje deskryptory podejść do późniejszego wykorzystania
     * @param attempt_descriptors Deskryptory podejść
     */
    public SaveDescriptors(attempt_descriptors: Collection<AttemptDescriptor>){
        this.AttemptDescriptors = attempt_descriptors;
    }

    /**
     * Wczytuje podejście o podanym identyfikatorze
     * @param attempt_id Identyfikator podejścia
     */
    public async LoadById(attempt_id: number){
        if(this.Assignment === undefined) throw 'AttemptLoader.Assignment nie może być undefined.';

        let response = await XHR.Request(ApiEndpoints.GetEntityUrl(this.Assignment) + '/attempts/' + attempt_id.toString() + '?depth=2', 'GET');
        let json = response.Response as AttemptDescriptor;
        return this.CreateFromDescriptor(json);
    }

    /**
     * Tworzy podejście na podstawie deskryptora
     * @param attempt_descriptor Deskryptor podejścia
     */
    public async CreateFromDescriptor(attempt_descriptor: AttemptDescriptor){
        if(this.Assignment === undefined) throw 'AttemptLoader.Assignment nie może być undefined.';

        let question_loader = new QuestionLoader(attempt_descriptor.path?.length);
        question_loader.SetTest(this.Assignment.Test);

        if(!Collection.IsEmpty(attempt_descriptor.questions))
            question_loader.SaveDescriptors(attempt_descriptor.questions);

        return new Attempt(
            attempt_descriptor.id,
            this.Assignment,
            await UserLoader.LoadById(attempt_descriptor.user_id),
            attempt_descriptor.score,
            attempt_descriptor.max_score,
            new Date(attempt_descriptor.begin_time),
            attempt_descriptor.path,
            question_loader
        );
    }

    /**
     * Zwraca wszystkie podejścia dla bieżącego przypisania
     */
    public async GetAllForAssignment(){
        if(this.Assignment === undefined) throw 'AttemptLoader.Assignment nie może być undefined.';

        let response = await XHR.Request(ApiEndpoints.GetEntityUrl(this.Assignment) + '/attempts?depth=2', 'GET');
        let descriptors = response.Response as Collection<AttemptDescriptor>;
        let out_array: Attempt[] = [];

        for(let attempt_id in descriptors){
            out_array.push(await this.CreateFromDescriptor(descriptors[parseInt(attempt_id)]));
        }

        return out_array;
    }
}
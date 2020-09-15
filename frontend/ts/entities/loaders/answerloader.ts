import * as XHR from '../../utils/xhr';
import Answer from '../answer';
import Question from '../question';
import { Collection } from '../entity';
import ApiEndpoints from './apiendpoints';

/** Deskryptor odpowiedzi w odpowiedzi z API */
export interface AnswerDescriptor {
    id: number;
    text: string;
    correct: boolean;
    order: number;
}

export default class AnswerLoader {
    public readonly AnswerCount: number | undefined;
    protected Question: Question | undefined;
    protected AnswerDescriptors: Collection<AnswerDescriptor> | undefined;

    constructor(answer_count?: number) {
        this.AnswerCount = answer_count;
    }

    /**
     * Ustawia pytanie, dla którego będą ładowane odpowiedzi
     * @param question Pytanie, dla którego będą ładowane odpowiedzi
     */
    public SetQuestion(question: Question) {
        this.Question = question;
    }

    /**
     * Zapisuje deskryptory odpowiedzi do późniejszego wykorzystania
     * @param answer_descriptors Deskryptory odpowiedzi
     */
    public SaveDescriptors(answer_descriptors: Collection<AnswerDescriptor>) {
        this.AnswerDescriptors = answer_descriptors;
    }

    /**
     * Wczytuje odpowiedź o podanym identyfikatorze
     * @param answer_id Identyfikator odpowiedzi
     */
    public async LoadById(answer_id: number) {
        if(this.Question === undefined) throw 'AnswerLoader.Question nie może być undefined.';

        let descriptor: AnswerDescriptor;
        if(this.AnswerDescriptors?.[answer_id] !== undefined) {
            descriptor = this.AnswerDescriptors[answer_id];
        } else {
            let response = await XHR.PerformRequest(ApiEndpoints.GetEntityUrl(this.Question) + '/answers/' + answer_id.toString() + '?depth=2', 'GET');
            descriptor = response.Response as AnswerDescriptor;
        }
        return this.CreateFromDescriptor(descriptor);
    }

    /**
     * Tworzy odpowiedź na podstawie deskryptora
     * @param answer_descriptor Deskryptor odpowiedzi
     */
    public CreateFromDescriptor(answer_descriptor: AnswerDescriptor) {
        if(this.Question === undefined) throw 'AnswerLoader.Question nie może być undefined.';

        return new Answer(
            answer_descriptor.id,
            this.Question,
            answer_descriptor.text,
            answer_descriptor.correct,
            answer_descriptor.order
        );
    }

    /**
     * Wczytuje wszystkie odpowiedzi dla bieżącego pytania
     */
    public async GetAllForCurrentQuestion() {
        if(this.Question === undefined) throw 'AnswerLoader.Question nie może być undefined.';

        let descriptors: Collection<AnswerDescriptor>;
        if(this.AnswerDescriptors !== undefined) {
            descriptors = this.AnswerDescriptors;
        } else {
            let response = await XHR.PerformRequest(ApiEndpoints.GetEntityUrl(this.Question) + '/answers?depth=3', 'GET');
            descriptors = response.Response as Collection<AnswerDescriptor>;
        }

        let out_array: Answer[] = [];
        Object.keys(descriptors).forEach((question_id) => {
            out_array.push(this.CreateFromDescriptor(descriptors[parseInt(question_id)]));
        });

        return out_array;
    }
}
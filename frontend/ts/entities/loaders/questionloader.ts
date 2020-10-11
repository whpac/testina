import XHR from '../../network/xhr';
import Test from '../test';
import { Collection } from '../entity';
import Question from '../question';
import AnswerLoader, { AnswerDescriptor } from './answerloader';
import ApiEndpoints from './apiendpoints';

/** Deskryptor pytania w odpowiedzi z API */
export interface QuestionDescriptor {
    id: number,
    text: string,
    type: number,
    points: number,
    points_counting: number,
    max_typos: number,
    answer_count: number,
    answers: Collection<AnswerDescriptor>;
    footer: string | null;
    order: number;
    is_optional: boolean;
    has_na: boolean;
    has_other: boolean;
}

export default class QuestionLoader {
    public readonly QuestionCount: number | undefined;
    protected Test: Test | undefined;
    protected QuestionDescriptors: Collection<QuestionDescriptor> | undefined;

    constructor(question_count?: number) {
        this.QuestionCount = question_count;
    }

    /**
     * Wczytuje pytanie o określonym identyfikatorze
     * @param test Test, do którego należy pytanie
     * @param question_id Identyfikator pytania
     */
    static async LoadById(test: Test, question_id: number) {
        let loader = new QuestionLoader();
        loader.SetTest(test);
        return loader.LoadById(question_id);
    }

    /**
     * Ustawia test, dla którego będą ładowane pytania
     * @param test Test, dla którego będą ładowane pytania
     */
    public SetTest(test: Test) {
        this.Test = test;
    }

    /**
     * Zapisuje deskryptory pytań do późniejszego wykorzystania
     * @param question_descriptors Deskryptory pytań
     */
    public SaveDescriptors(question_descriptors: Collection<QuestionDescriptor>) {
        this.QuestionDescriptors = question_descriptors;
    }

    /**
     * Wczytuje pytanie o określonym identyfikatorze
     * @param question_id Identyfikator pytania
     */
    public async LoadById(question_id: number) {
        if(this.Test === undefined) throw 'QuestionLoader.Test nie może być undefined';

        let descriptor: QuestionDescriptor;
        if(this.QuestionDescriptors?.[question_id] !== undefined) {
            descriptor = this.QuestionDescriptors[question_id];
        } else {
            let response = await XHR.PerformRequest(ApiEndpoints.GetEntityUrl(this.Test) + '/questions/' + question_id.toString() + '?depth=2', 'GET');
            descriptor = response.Response as QuestionDescriptor;
        }

        return this.CreateFromDescriptor(descriptor);
    }

    /**
     * Tworzy pytanie na podstawie deskryptora
     * @param question_descriptor Deskryptor pytania
     */
    public CreateFromDescriptor(question_descriptor: QuestionDescriptor) {
        if(this.Test === undefined) throw 'QuestionLoader.Test nie może być undefined';

        let answer_loader = new AnswerLoader(question_descriptor.answer_count);

        let question = new Question(
            question_descriptor.id,
            this.Test,
            question_descriptor.text,
            question_descriptor.type,
            question_descriptor.points,
            question_descriptor.points_counting,
            question_descriptor.max_typos,
            answer_loader,
            question_descriptor.footer,
            question_descriptor.order,
            question_descriptor.is_optional,
            question_descriptor.has_na,
            question_descriptor.has_other
        );

        answer_loader.SetQuestion(question);
        if(!Collection.IsEmpty(question_descriptor.answers))
            answer_loader.SaveDescriptors(question_descriptor.answers);

        return question;
    }

    /** Zwraca wszystkie pytania w wybranym teście */
    public async GetAllInCurrentTest() {
        if(this.Test === undefined) throw 'QuestionLoader.Test nie może być undefined';

        let descriptors: Collection<QuestionDescriptor>;
        if(this.QuestionDescriptors !== undefined) {
            descriptors = this.QuestionDescriptors;
        } else {
            let response = await XHR.PerformRequest(ApiEndpoints.GetEntityUrl(this.Test) + '/questions?depth=3', 'GET');
            descriptors = response.Response as Collection<QuestionDescriptor>;
        }

        let out_array: Question[] = [];
        Object.keys(descriptors).forEach((question_id) => {
            out_array.push(this.CreateFromDescriptor(descriptors[parseInt(question_id)]));
        });

        return out_array;
    }
}
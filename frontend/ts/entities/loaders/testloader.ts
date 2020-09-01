import * as XHR from '../../utils/xhr';

import UserLoader from './userloader';
import { Collection } from '../entity';
import Test from '../test';
import QuestionLoader, { QuestionDescriptor } from './questionloader';
import AssignmentLoader from './assignmentloader';

/** Deskryptor testu w odpowiedzi z API */
export interface TestDescriptor {
    id: number,
    name: string,
    author_id: number,
    creation_date: string,
    time_limit: number,
    type: number,
    description: string | null;
    question_multiplier: number,
    question_count: number,
    questions: Collection<QuestionDescriptor>,
    assignment_count: number | undefined,
    assignment_ids: number[];
}

export default class TestLoader {

    /**
     * Wczytuje test o określonym identyfikatorze
     * @param test_id Identyfikator testu
     */
    public static async LoadById(test_id: number) {
        let response = await XHR.PerformRequest('api/tests/' + test_id.toString() + '?depth=3', 'GET');
        let json = response.Response as TestDescriptor;
        return this.CreateFromDescriptor(json);
    }

    /**
     * Tworzy test na podstawie deskryptora
     * @param test_descriptor Deskryptor testu
     */
    public static async CreateFromDescriptor(test_descriptor: TestDescriptor) {
        let question_loader = new QuestionLoader(test_descriptor.question_count);

        let assignment_loader = () => new AssignmentLoader().LoadById(test_descriptor.assignment_ids);

        let test = new Test(
            test_descriptor.id,
            test_descriptor.name,
            await UserLoader.LoadById(test_descriptor.author_id),
            new Date(test_descriptor.creation_date),
            test_descriptor.time_limit,
            test_descriptor.question_multiplier,
            question_loader,
            test_descriptor.assignment_count,
            assignment_loader,
            test_descriptor.type,
            test_descriptor.description
        );

        question_loader.SetTest(test);

        if(!Collection.IsEmpty(test_descriptor.questions))
            question_loader.SaveDescriptors(test_descriptor.questions);

        return test;
    }

    /** Wczytuje wszystkie testy utworzone przez bieżącego użytkownika */
    public static async GetCreatedByCurrentUser() {
        let response = await XHR.PerformRequest('api/tests?depth=4', 'GET');
        let descriptors = response.Response as Collection<TestDescriptor>;
        let out_array: Test[] = [];

        for(let test_id in descriptors) {
            out_array.push(await this.CreateFromDescriptor(descriptors[parseInt(test_id)]));
        }

        return out_array;
    }
}
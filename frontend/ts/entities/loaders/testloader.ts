import * as XHR from '../../utils/xhr';

import UserLoader, { UserDescriptor } from './userloader';
import { Collection } from '../entity';
import Test from '../test';
import QuestionLoader, { QuestionDescriptor } from './questionloader';
import AssignmentLoader, { AssignmentDescriptor } from './assignmentloader';

/** Deskryptor testu w odpowiedzi z API */
export interface TestDescriptor {
    id: number,
    name: string,
    author: UserDescriptor,
    creation_date: string,
    time_limit: number,
    question_multiplier: number,
    question_count: number,
    questions: Collection<QuestionDescriptor>,
    assignment_count: number | undefined,
    assignments: Collection<AssignmentDescriptor>
}

export default class TestLoader {

    /**
     * Wczytuje test o określonym identyfikatorze
     * @param test_id Identyfikator testu
     */
    public static async LoadById(test_id: number){
        let response = await XHR.Request('api/tests/' + test_id.toString() + '?depth=3', 'GET');
        let json = response.Response as TestDescriptor;
        return this.CreateFromDescriptor(json);
    }

    /**
     * Tworzy test na podstawie deskryptora
     * @param test_descriptor Deskryptor testu
     */
    public static CreateFromDescriptor(test_descriptor: TestDescriptor){
        let question_loader = new QuestionLoader(test_descriptor.question_count);
        let assignment_loader = new AssignmentLoader(test_descriptor.assignment_count);

        let test = new Test(
            test_descriptor.id,
            test_descriptor.name,
            UserLoader.CreateFromDescriptor(test_descriptor.author),
            new Date(test_descriptor.creation_date),
            test_descriptor.time_limit,
            test_descriptor.question_multiplier,
            question_loader,
            assignment_loader
        );

        question_loader.SetTest(test);
        assignment_loader.SetTest(test);

        if(!Collection.IsEmpty(test_descriptor.questions))
            question_loader.SaveDescriptors(test_descriptor.questions);
        if(!Collection.IsEmpty(test_descriptor.assignments))
            assignment_loader.SaveDescriptors(test_descriptor.assignments);

        return test;
    }

    /** Wczytuje wszystkie testy utworzone przez bieżącego użytkownika */
    public static async GetCreatedByCurrentUser(){
        let response = await XHR.Request('api/tests?depth=4', 'GET');
        let json = response.Response as Collection<TestDescriptor>;
        let out_array: Test[] = [];

        Object.keys(json).forEach((test_id) => {
            out_array.push(this.CreateFromDescriptor(json[parseInt(test_id)]));
        });

        return out_array;
    }
}
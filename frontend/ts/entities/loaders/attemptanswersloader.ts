import XHR from '../../network/xhr';
import Attempt from '../attempt';
import AttemptAnswers from '../attempt_answers';
import { StringKeyedCollection } from '../question_with_user_answers';
import ApiEndpoints from './apiendpoints';

interface AttemptAnswersDescriptor {
    question_id: number;
    question_index: number;
    answer_ids: number[];
    supplied_answer: string;
    is_open: boolean;
    score_got: number;
}

export default class AttemptAnswersLoader {

    public static async LoadAnswersForAttempt(attempt: Attempt) {
        let response = await XHR.PerformRequest(ApiEndpoints.GetEntityUrl(attempt) + '/answers/get');
        let descriptor = response.Response as StringKeyedCollection<AttemptAnswersDescriptor>;
        return AttemptAnswersLoader.CreateFromDescriptor(attempt, descriptor);
    }

    protected static CreateFromDescriptor(attempt: Attempt, descriptors: StringKeyedCollection<AttemptAnswersDescriptor>): AttemptAnswers[] {
        let attempt_answers = [];
        for(let i in descriptors) {
            let descriptor = descriptors[i];
            attempt_answers.push(new AttemptAnswers(
                attempt,
                descriptor.question_id,
                descriptor.question_index,
                descriptor.answer_ids,
                descriptor.supplied_answer,
                descriptor.is_open,
                descriptor.score_got
            ));
        }

        return attempt_answers;
    }
}
import * as XHR from '../../utils/xhr';
import { Collection } from '../entity';
import ApiEndpoints from './apiendpoints';
import Test from '../test';
import SurveyResults, { SurveyResultsClosedAnswer, SurveyResultsQuestion } from '../survey_results';

/** Deskryptor podejścia w odpowiedzi z API */
export interface SurveyResultsDescriptor {
    questions: Collection<SurveyResultsQuestionDescriptor>;
}

interface SurveyResultsQuestionDescriptor {
    id: number;
    text: string;
    answer_count: number;
    order: number;
    user_supplied_answers: string[];
    closed_answers: {
        id: number;
        text: string;
        answer_count: number;
        order: number;
    }[];
}

export default class SurveyResultsLoader {
    /**
     * Wczytuje wyniki ankiety
     * @param survey Ankieta
     */
    public static async Load(survey: Test) {
        let response = await XHR.PerformRequest(ApiEndpoints.GetEntityUrl(survey) + '/results?depth=5', 'GET');
        let json = response.Response as SurveyResultsDescriptor;
        return this.CreateFromDescriptor(json);
    }

    /**
     * Tworzy wyniki na podstawie deskryptora
     * @param results_descriptor Deskryptor wyników
     */
    public static CreateFromDescriptor(results_descriptor: SurveyResultsDescriptor) {
        let questions: SurveyResultsQuestion[] = [];
        for(let question_id in results_descriptor.questions) {
            let question = results_descriptor.questions[question_id];

            let answers: SurveyResultsClosedAnswer[] = [];
            for(let closed_answer of question.closed_answers) {
                answers.push(new SurveyResultsClosedAnswer(
                    closed_answer.id,
                    closed_answer.text.toString(),
                    closed_answer.answer_count,
                    closed_answer.order
                ));
            }

            questions.push(new SurveyResultsQuestion(
                question.id,
                question.text,
                question.answer_count,
                question.order,
                question.user_supplied_answers,
                answers));
        }

        questions = questions.sort((a, b) => a.Order - b.Order);

        return new SurveyResults(questions);
    }
}
import XHR from '../network/xhr';
import XHROptions from '../network/xhr_options';
import Attempt from './attempt';
import ApiEndpoints from './loaders/apiendpoints';

export default class AttemptAnswers {
    public readonly Attempt: Attempt;
    public readonly QuestionId: number;
    public readonly QuestionIndex: number;
    public readonly AnswerIds: number[];
    public readonly SuppliedAnswer: string;
    public readonly IsOpen: boolean;
    public _ScoreGot: number | null;

    public get ScoreGot() {
        return this._ScoreGot;
    }

    public constructor(attempt: Attempt, question_id: number, question_index: number,
        answer_ids: number[], supplied_answer: string, is_open: boolean, score_got: number | null) {

        this.Attempt = attempt;
        this.QuestionId = question_id;
        this.QuestionIndex = question_index;
        this.AnswerIds = answer_ids;
        this.SuppliedAnswer = supplied_answer;
        this.IsOpen = is_open;
        this._ScoreGot = score_got;
    }

    public async UpdateScore(new_score: number) {
        let options: XHROptions = {
            Method: 'PUT',
            RequestData: {
                question_index: this.QuestionIndex,
                new_score: new_score
            }
        };

        let result = await XHR.PerformRequest(ApiEndpoints.GetEntityUrl(this.Attempt) + '/answers', options);
        if(result.Status != 204) throw result;

        this._ScoreGot = new_score;
    }
}
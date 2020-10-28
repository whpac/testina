export default class AttemptAnswers {
    public readonly QuestionId: number;
    public readonly AnswerIds: number[];
    public readonly SuppliedAnswer: string;
    public readonly IsOpen: boolean;
    public readonly ScoreGot: number;

    public constructor(question_id: number, answer_ids: number[],
        supplied_answer: string, is_open: boolean, score_got: number) {

        this.QuestionId = question_id;
        this.AnswerIds = answer_ids;
        this.SuppliedAnswer = supplied_answer;
        this.IsOpen = is_open;
        this.ScoreGot = score_got;
    }
}
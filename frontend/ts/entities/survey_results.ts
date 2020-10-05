import Entity, { Collection } from './entity';

export default class SurveyResults extends Entity {
    public readonly Questions: SurveyResultsQuestion[];

    public constructor(questions: SurveyResultsQuestion[]) {
        super();

        this.Questions = questions;
    }
}

export class SurveyResultsQuestion extends Entity {
    public readonly Id: number;
    public readonly Text: string;
    public readonly AnswerCount: number;
    public readonly Order: number;
    public readonly UserSuppliedAnswers: string[];
    public readonly ClosedAnswers: SurveyResultsClosedAnswer[];

    public constructor(id: number, text: string, answer_count: number, order: number, user_supplied_answers: string[], closed_answers: SurveyResultsClosedAnswer[]) {
        super();

        this.Id = id;
        this.Text = text;
        this.AnswerCount = answer_count;
        this.Order = order;
        this.UserSuppliedAnswers = user_supplied_answers;
        this.ClosedAnswers = closed_answers;
    }
}

export class SurveyResultsClosedAnswer extends Entity {
    public readonly Id: number;
    public readonly Text: string;
    public readonly AnswerCount: number;

    public constructor(id: number, text: string, answer_count: number) {
        super();

        this.Id = id;
        this.Text = text;
        this.AnswerCount = answer_count;
    }
}
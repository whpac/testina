import Answer from '../schemas/answer';
import Collection from '../schemas/collection';
import Question, { QuestionPointsCounting, QuestionType } from '../schemas/question';
import ConcreteAnswerCollection from './concrete_answer_collection';
import ConcreteEntity from './concrete_entity';

export default class ConcreteQuestion extends ConcreteEntity implements Question {
    protected Answers: Collection<number, Answer>;

    public constructor(
        protected Id: number,
        protected Test: unknown,
        protected Text: string,
        protected Type: QuestionType,
        protected Points: number,
        protected PointsCounting: QuestionPointsCounting,
        protected MaxTypos: number,
        protected Footer: string,
        protected Order: number,
        protected Optional: boolean,
        protected WithNonApplicableAnswer: boolean,
        protected WithOtherAnswer: boolean,
        answers: Iterable<[number, Answer]> = []
    ) {
        super();
        this.Answers = new ConcreteAnswerCollection(answers);
    }

    GetId(): number {
        return this.Id;
    }
    GetTest(): unknown {
        return this.Test;
    }

    GetText(): string {
        return this.Text;
    }
    SetText(new_text: string): void {
        this.Text = new_text;
    }

    GetType(): QuestionType {
        return this.Type;
    }
    SetType(new_type: QuestionType): void {
        this.Type = new_type;
    }

    GetPoints(): number {
        return this.Points;
    }
    SetPoints(new_points: number): void {
        this.Points = new_points;
    }

    GetPointsCounting(): QuestionPointsCounting {
        return this.PointsCounting;
    }
    SetPointsCounting(new_points_counting: QuestionPointsCounting): void {
        this.PointsCounting = new_points_counting;
    }

    GetMaxTypos(): number {
        return this.MaxTypos;
    }
    SetMaxTypos(new_max_typos: number): void {
        this.MaxTypos = new_max_typos;
    }

    GetFooter(): string {
        return this.Footer;
    }
    SetFooter(new_footer: string): void {
        this.Footer = new_footer;
    }

    GetOrder(): number {
        return this.Order;
    }
    SetOrder(new_order: number): void {
        this.Order = new_order;
    }

    IsOptional(): boolean {
        return this.Optional;
    }
    SetIsOptional(new_is_optional: boolean): void {
        this.Optional = new_is_optional;
    }

    HasNonApplicableAnswer(): boolean {
        return this.WithNonApplicableAnswer;
    }
    SetHasNonApplicableAnswer(new_has_non_applicable_answer: boolean): void {
        this.WithNonApplicableAnswer = new_has_non_applicable_answer;
    }

    HasOtherAnswer(): boolean {
        return this.WithOtherAnswer;
    }
    SetHasOtherAnswer(new_has_other_answer: boolean): void {
        this.WithOtherAnswer = new_has_other_answer;
    }

    GetAnswers(): Collection<number, Answer> | Promise<Collection<number, Answer>> | PromiseLike<Collection<number, Answer>> {
        return this.Answers;
    }
    SetAnswers(new_answers: Collection<number, Answer>): void {
        this.Answers = new_answers;
    }
}
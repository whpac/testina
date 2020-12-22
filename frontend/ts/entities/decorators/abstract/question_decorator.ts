import ConcreteEntity from '../../concrete/concrete_entity';
import Answer from '../../schemas/answer';
import Collection from '../../schemas/collection';
import Question, { QuestionPointsCounting, QuestionType } from '../../schemas/question';

export default class QuestionDecorator extends ConcreteEntity implements Question {

    public constructor(
        protected Question: Question
    ) {
        super();
    }

    GetId(): number {
        return this.Question.GetId();
    }
    GetTest(): unknown {
        return this.Question.GetTest();
    }

    GetText(): string {
        return this.Question.GetText();
    }
    SetText(new_text: string): void {
        this.Question.SetText(new_text);
        this.FireEvent('changed');
    }

    GetType(): QuestionType {
        return this.Question.GetType();
    }
    SetType(new_type: QuestionType): void {
        this.Question.SetType(new_type);
        this.FireEvent('changed');
    }

    GetPoints(): number {
        return this.Question.GetPoints();
    }
    SetPoints(new_points: number): void {
        this.Question.SetPoints(new_points);
        this.FireEvent('changed');
    }

    GetPointsCounting(): QuestionPointsCounting {
        return this.Question.GetPointsCounting();
    }
    SetPointsCounting(new_points_counting: QuestionPointsCounting): void {
        this.Question.SetPointsCounting(new_points_counting);
        this.FireEvent('changed');
    }

    GetMaxTypos(): number {
        return this.Question.GetMaxTypos();
    }
    SetMaxTypos(new_max_typos: number): void {
        this.Question.SetMaxTypos(new_max_typos);
        this.FireEvent('changed');
    }

    GetFooter(): string {
        return this.Question.GetFooter();
    }
    SetFooter(new_footer: string): void {
        this.Question.SetFooter(new_footer);
        this.FireEvent('changed');
    }

    GetOrder(): number {
        return this.Question.GetOrder();
    }
    SetOrder(new_order: number): void {
        this.Question.SetOrder(new_order);
        this.FireEvent('changed');
    }

    IsOptional(): boolean {
        return this.Question.IsOptional();
    }
    SetIsOptional(new_is_optional: boolean): void {
        this.Question.SetIsOptional(new_is_optional);
        this.FireEvent('changed');
    }

    HasNonApplicableAnswer(): boolean {
        return this.Question.HasNonApplicableAnswer();
    }
    SetHasNonApplicableAnswer(new_has_non_applicable_answer: boolean): void {
        this.Question.SetHasNonApplicableAnswer(new_has_non_applicable_answer);
        this.FireEvent('changed');
    }

    HasOtherAnswer(): boolean {
        return this.Question.HasOtherAnswer();
    }
    SetHasOtherAnswer(new_has_other_answer: boolean): void {
        this.Question.SetHasOtherAnswer(new_has_other_answer);
        this.FireEvent('changed');
    }

    GetAnswers(): Collection<number, Answer> | Promise<Collection<number, Answer>> | PromiseLike<Collection<number, Answer>> {
        return this.Question.GetAnswers();
    }
    SetAnswers(new_answers: Collection<number, Answer>): void {
        this.Question.SetAnswers(new_answers);
        this.FireEvent('changed');
    }
}
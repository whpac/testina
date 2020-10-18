import Answer from '../schemas/answer';
import Question from '../schemas/question';

export default abstract class AnswerDecorator implements Answer {

    public constructor(
        protected Answer: Answer
    ) { }

    GetId(): number {
        return this.Answer.GetId();
    }

    GetQuestion(): Question {
        return this.Answer.GetQuestion();
    }

    GetText(): string {
        return this.Answer.GetText();
    }
    SetText(new_text: string): void {
        this.Answer.SetText(new_text);
    }

    IsCorrect(): boolean {
        return this.Answer.IsCorrect();
    }
    SetIsCorrect(new_correct: boolean): void {
        this.Answer.SetIsCorrect(new_correct);
    }

    GetOrder(): number {
        return this.Answer.GetOrder();
    }
    SetOrder(new_order: number): void {
        this.Answer.SetOrder(new_order);
    }
}
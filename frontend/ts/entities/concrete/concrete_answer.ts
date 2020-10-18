import Answer from '../schemas/answer';
import Question from '../schemas/question';

export default class ConcreteAnswer implements Answer {

    public constructor(
        protected Id: number,
        protected Question: Question,
        protected Text: string,
        protected Correct: boolean,
        protected Order: number
    ) { }

    GetId(): number {
        return this.Id;
    }

    GetQuestion(): Question {
        return this.Question;
    }

    GetText(): string {
        return this.Text;
    }
    SetText(new_text: string): void {
        this.Text = new_text;
    }

    IsCorrect(): boolean {
        return this.Correct;
    }
    SetIsCorrect(new_correct: boolean): void {
        this.Correct = new_correct;
    }

    GetOrder(): number {
        return this.Order;
    }
    SetOrder(new_order: number): void {
        this.Order = new_order;
    }
}
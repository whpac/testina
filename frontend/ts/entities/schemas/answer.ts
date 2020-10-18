import Question from './question';

export default interface Answer {

    GetId(): number;
    GetQuestion(): Question;

    GetText(): string;
    SetText(new_text: string): void;

    IsCorrect(): boolean;
    SetIsCorrect(new_correct: boolean): void;

    GetOrder(): number;
    SetOrder(new_order: number): void;
}
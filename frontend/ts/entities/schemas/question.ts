import Answer from './answer';
import Collection from './collection';

export default interface Question {

    GetId(): number;
    GetTest(): unknown;

    GetText(): string;
    SetText(new_text: string): void;

    GetType(): QuestionType;
    SetType(new_type: QuestionType): void;

    GetPoints(): number;
    SetPoints(new_points: number): void;

    GetPointsCounting(): QuestionPointsCounting;
    SetPointsCounting(new_points_counting: QuestionPointsCounting): void;

    GetMaxTypos(): number;
    SetMaxTypos(new_max_typos: number): void;

    GetFooter(): string;
    SetFooter(new_footer: string): void;

    GetOrder(): number;
    SetOrder(new_order: number): void;

    IsOptional(): boolean;
    SetIsOptional(new_is_optional: boolean): void;

    HasNonApplicableAnswer(): boolean;
    SetHasNonApplicableAnswer(new_has_non_applicable_answer: boolean): void;

    HasOtherAnswer(): boolean;
    SetHasOtherAnswer(new_has_other_answer: boolean): void;

    GetAnswers(): Collection<number, Answer> | Promise<Collection<number, Answer>> | PromiseLike<Collection<number, Answer>>;
    SetAnswers(new_answers: Collection<number, Answer>): void;
}

export enum QuestionType {
    /** Pytanie zamknięte jednokrotnego wyboru */
    SINGLE_CHOICE = 0,
    /** Pytanie zamknięte wielokrotnego wyboru */
    MULTI_CHOICE = 1,
    /** Pytanie otwarte */
    OPEN_ANSWER = 2,
    /** Pytanie o liczbę z zakresu */
    RANGE = 3
}

export enum QuestionPointsCounting {
    /** Po ułamku punktu za każdy dobry wybór */
    LINEAR = 0,
    /** Punkty tylko za całkowicie dobrą odpowiedź */
    BINARY = 1,
    /** Sposób liczenia reprezentujący pytanie otwarte */
    OPEN_ANSWER = 2
}
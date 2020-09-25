import Answer from './answer';
import Question from './question';
import Levenshtein from '../utils/levenshtein';

type StringKeyedCollection<T> = {
    [key: string]: T;
};

/** Klasa reprezentująca pytanie z odpowiedziami użytkownika */
export default class QuestionWithUserAnswers {
    /** Pytanie */
    protected Question: Question;
    /** Odpowiedzi do pytania */
    protected Answers: StringKeyedCollection<Answer>;
    /** Czy dana odpowiedź została zaznaczona */
    protected IsAnswerSelected: StringKeyedCollection<boolean>;
    /** Czy rozwiązywanie pytania zostało ukończone */
    protected IsDone: boolean;
    /** Zdobyty wynik punktowy za pytanie */
    protected Score: number | undefined;
    /** Czy zaznaczono "nie dotyczy" */
    protected _IsNonApplicableSelected: boolean = false;
    /** Odpowiedź podana przez rozwiązującego */
    public UserSuppliedAnswer: string | undefined;

    /** Czy zaznaczono "nie dotyczy" */
    public get IsNonApplicableSelected() {
        return this._IsNonApplicableSelected;
    }

    /**
     * Klasa reprezentująca pytanie z odpowiedziami użytkownika
     * @param question Pytanie, do którego odpowiedzi mają być przechowywane
     */
    constructor(question: Question) {
        this.Question = question;
        this.Answers = {};
        this.IsAnswerSelected = {};
        this.IsDone = false;
    }

    /**
     * Tworzy tablicę QuestionWithUserAnswers[] z tablicy Question[]
     * @param questions Wejściowa tablica
     */
    static FromArray(questions: Question[]) {
        let result: QuestionWithUserAnswers[] = [];
        for(let question of questions) {
            result.push(new QuestionWithUserAnswers(question));
        }
        return result;
    }

    /** Zwraca pytanie */
    public GetQuestion() {
        return this.Question;
    }

    /**
     * Ustawia tablicę odpowiedzi i oznacza je wszystkie jako niezaznaczone
     * @param answers Tablica odpowiedzi
     */
    public SetAnswers(answers: Answer[]) {
        this.Answers = {};
        for(let answer of answers) {
            this.Answers[answer.Id] = answer;
        }
        this.DeselectAllAnswers();
    }

    /** Zwraca odpowiedzi */
    public GetAnswers() {
        return this.Answers;
    }

    /** Zwraca zaznaczone odpowiedzi */
    public GetSelectedAnswers() {
        let selected: Answer[] = [];
        for(let id in this.Answers) {
            if(this.IsAnswerSelected[id]) selected.push(this.Answers[id]);
        }
        return selected;
    }

    /** Oznacza wszystkie odpowiedzi jako niezaznaczone */
    public DeselectAllAnswers() {
        for(let id in this.Answers) {
            this.IsAnswerSelected[id] = false;
        }
        this._IsNonApplicableSelected = false;
    }

    /**
     * Oznacza daną odpowiedź jako zaznaczoną bądź niezaznaczoną
     * @param id Identyfikator odpowiedzi
     * @param is_selected Czy wskazana odpowiedź ma być zaznaczona
     */
    public SetAnswerSelection(id: string, is_selected: boolean) {
        if(id == '-1') this._IsNonApplicableSelected = is_selected;
        else this.IsAnswerSelected[id] = is_selected;
    }

    /**
     * Zwraca, czy dana odpowiedź jest zaznaczona
     * @param id Identyfikator odpowiedzi
     */
    public GetAnswerSelection(id: string) {
        if(id == '-1') return this._IsNonApplicableSelected;
        return this.IsAnswerSelected[id] ?? false;
    }

    /**
     * Zmienia zaznaczenie odpowiedzi
     * @param id Identyfikator odpowiedzi
     */
    public ToggleAnswerSelection(id: string) {
        if(id == '-1') this._IsNonApplicableSelected = !this._IsNonApplicableSelected;
        this.IsAnswerSelected[id] = !this.IsAnswerSelected[id];
    }

    /** Oznacza pytanie jako ukończone */
    public MarkAsDone() {
        this.IsDone = true;
    }

    /** Sprawdza, czy pytanie jest ukończone */
    public GetIsDone() {
        return this.IsDone;
    }

    /** Liczy uzyskane punkty */
    public CountPoints() {
        if(!this.IsDone) return 0;
        if(this.Score !== undefined) return this.Score;

        console.log(this.Answers);

        switch(this.Question.Type) {
            case Question.TYPE_SINGLE_CHOICE:
            case Question.TYPE_MULTI_CHOICE:
                return this.Score = this.CountPointsClosedAnswer();
                break;
            case Question.TYPE_OPEN_ANSWER:
                return this.Score = this.CountPointsOpenAnswer();
                break;
        }
        return 0;
    }

    protected CountPointsClosedAnswer() {
        switch(this.Question.PointsCounting) {
            case Question.COUNTING_BINARY:
                let number_of_errors = 0;
                for(let id in this.IsAnswerSelected) {
                    if(this.IsAnswerSelected[id] != this.Answers[id].Correct) {
                        number_of_errors++;
                    }
                }

                if(number_of_errors == 0) {
                    return this.Question.Points;
                } else {
                    return 0;
                }
                break;

            case Question.COUNTING_LINEAR:
                let number_of_wrong_choices = 0;
                let number_of_correct_answers = 0;
                for(let id in this.IsAnswerSelected) {
                    if(this.IsAnswerSelected[id] != this.Answers[id].Correct) {
                        number_of_wrong_choices++;
                    }
                    if(this.Answers[id].Correct) {
                        number_of_correct_answers++;
                    }
                }

                let correct_factor = 1 - (number_of_wrong_choices / number_of_correct_answers);
                if(correct_factor < 0) correct_factor = 0;
                return correct_factor * this.Question.Points;
                break;

            default:
                return 0;
        }
    }

    protected CountPointsOpenAnswer() {
        if(this.UserSuppliedAnswer === undefined) return 0;

        for(let id in this.Answers) {
            let answer = this.Answers[id];
            if(!answer.Correct) continue;

            if(this.Question.MaxTypos <= 0) {
                if(answer.Text == this.UserSuppliedAnswer) return this.Question.Points;
            } else {
                if(Levenshtein(answer.Text, this.UserSuppliedAnswer) <= this.Question.MaxTypos)
                    return this.Question.Points;
            }
        }

        return 0;
    }
}
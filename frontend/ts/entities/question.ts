import * as XHR from '../utils/xhr';
import Test from './test';
import Entity from './entity';
import Answer from './answer';
import QuestionLoader from './loaders/questionloader';
import AnswerLoader from './loaders/answerloader';

/** Klasa reprezentująca pytanie */
export default class Question extends Entity {
    /** Pytanie zamknięte jednokrotnego wyboru */
    public static TYPE_SINGLE_CHOICE = 0;
    /** Pytanie zamknięte wielokrotnego wyboru */
    public static TYPE_MULTI_CHOICE = 1;
    /** Pytanie otwarte */
    public static TYPE_OPEN_ANSWER = 2;

    /** Po ułamku punktu za każdy dobry wybór */
    public static COUNTING_LINEAR = 0;
    /** Punkty tylko za całkowicie dobrą odpowiedź */
    public static COUNTING_BINARY = 1;
    /** Sposób liczenia reprezentujący pytanie otwarte */
    public static COUNTING_OPEN_ANSWER = 2;

    /** Unikatowy identyfikator pytania */
    public readonly Id: number;
    /** Test, do którego pytanie należy */
    public readonly Test: Test;
    /** Treść pytania */
    protected _Text: string;
    /** Typ pytania */
    protected _Type: number;
    /** Ilość punktów do zdobycia */
    protected _Points: number;
    /** Sposób liczenia punktów */
    protected _PointsCounting: number;
    /** Maksymalna dozwolona liczba literówek */
    protected _MaxTypos: number;
    /** Ilość odpowiedzi */
    public readonly AnswerCount: number | undefined;

    /** Treść pytania */
    public get Text() {
        return this._Text;
    }
    public set Text(new_value: string) {
        this._Text = new_value;
        this.FireEvent('change');
    }

    /** Typ pytania */
    public get Type() {
        return this._Type;
    }
    public set Type(new_value: number) {
        this._Type = new_value;
        this.FireEvent('change');
    }

    /** Ilość punktów do zdobycia */
    public get Points() {
        return this._Points;
    }
    public set Points(new_value: number) {
        this._Points = new_value;
        this.FireEvent('change');
    }

    /** Sposób liczenia punktów */
    public get PointsCounting() {
        return this._PointsCounting;
    }
    public set PointsCounting(new_value: number) {
        this._PointsCounting = new_value;
        this.FireEvent('change');
    }

    /** Maksymalna dozwolona liczba literówek */
    public get MaxTypos() {
        return this._MaxTypos;
    }
    public set MaxTypos(new_value: number) {
        this._MaxTypos = new_value;
        this.FireEvent('change');
    }

    /** Obiekt odpowiedzialny za wczytywanie odpowiedzi dla tego pytania */
    protected AnswerLoader: AnswerLoader;

    /**
     * Klasa reprezentująca pytanie
     * @param id Identyfikator pytania
     * @param test Test, do którego należy pytanie
     * @param text Treść pytania
     * @param type Rodzaj pytania
     * @param points Ilość punktów do zdobycia
     * @param points_counting Sposób liczenia punktów
     * @param max_typos Maksymalna dopuszczalna ilość literówek
     * @param answer_loader Obiekt wczytujący odpowiedzi
     */
    constructor(id: number, test: Test, text: string, type: number, points: number,
        points_counting: number, max_typos: number, answer_loader: AnswerLoader) {
        super();

        this.Id = id;
        this.Test = test;
        this._Text = text;
        this._Type = type;
        this._Points = points;
        this._PointsCounting = points_counting;
        this._MaxTypos = max_typos;
        this.AnswerCount = answer_loader.AnswerCount;

        this.AnswerLoader = answer_loader;
    }

    protected _Answers: Answer[] | undefined;
    /** Zwraca odpowiedzi do tego pytania */
    public async GetAnswers() {
        if(this._Answers === undefined) {
            this._Answers = await this.AnswerLoader.GetAllForCurrentQuestion();
        }
        return this._Answers;
    }

    /**
     * Tworzy nowe pytanie
     * @param test Test, do którego pytanie ma należeć
     * @param text Treść
     * @param type Typ pytania
     * @param points Liczba punktów do zdobycia
     * @param points_counting Sposób liczenia punktów
     * @param max_typos Maksymalna liczba literówek
     */
    static async Create(test: Test, text: string, type: number, points: number, points_counting: number, max_typos: number) {
        let request_data = {
            text: text,
            type: type,
            points: points,
            points_counting: points_counting,
            max_typos: max_typos
        };
        let result = await XHR.PerformRequest('api/tests/' + test.Id.toString() + '/questions', 'POST', request_data);

        if(result.Status != 201) throw result;

        test.OnQuestionAdded();

        return QuestionLoader.LoadById(test, parseInt(result.ContentLocation));
    }

    /**
     * Aktualizuje pytanie
     * @param text Nowa treść
     * @param type Nowy typ pytania
     * @param points Nowa ilość punktów do zdobycia
     * @param points_counting Nowy sposób liczenia punktów
     * @param max_typos Nowa maksymalna ilość literówek
     */
    async Update(text: string, type: number, points: number, points_counting: number, max_typos: number) {
        let request_data = {
            text: text,
            type: type,
            points: points,
            points_counting: points_counting,
            max_typos: max_typos
        };
        let result = await XHR.PerformRequest('api/tests/' + this.Test.Id.toString() + '/questions/' + this.Id.toString(), 'PUT', request_data);
        if(result.Status == 204) {
            this.Text = text;
            this.Type = type;
            this.Points = points;
            this.PointsCounting = points_counting;
            this.MaxTypos = max_typos;
            //this.FireEvent('change');
        } else throw result;
    }

    /** Usuwa pytanie */
    async Remove() {
        let result = await XHR.PerformRequest('api/tests/' + this.Test.Id.toString() + '/questions/' + this.Id.toString(), 'DELETE');
        if(result.Status == 204) {
            this.FireEvent('remove');
            this.Test.OnQuestionRemoved();
        } else throw result;
    }
}
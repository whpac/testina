import * as XHR from '../utils/xhr';
import Entity, { Collection } from './entity';
import User from './user';
import PageParams from '../1page/page_params';

import Question from './question';
import Assignment from './assignment';
import TestLoader from './loaders/testloader';
import QuestionLoader from './loaders/questionloader';
import AssignmentLoader, { AssignmentDescriptor } from './loaders/assignmentloader';
import SurveyLoader from './loaders/surveyloader';
import ApiEndpoints from './loaders/apiendpoints';

/** Klasa reprezentująca test */
export default class Test extends Entity implements PageParams {
    /** Test */
    public static TYPE_TEST = 0;
    /** Ankieta */
    public static TYPE_SURVEY = 1;

    /** Średnia z podejść */
    public static SCORE_AVERAGE = 0;
    /** Wynik najlepszego podejścia */
    public static SCORE_BEST = 1;

    /** Unikatowy identyfikator testu */
    public readonly Id: number;
    /** Nazwa testu */
    protected _Name: string;
    /** Autor testu */
    public readonly Author: User;
    /** Data utworzenia testu */
    public readonly CreationDate: Date;
    /** Limit czasu na rozwiązanie testu */
    protected _TimeLimit: number;
    /** Mnożnik pytań */
    protected _QuestionMultiplier: number;
    /** Ilość pytań (bez uwzględniania mnożnika) */
    protected _QuestionCount: number | undefined;
    /** Ile razy test został przypisany */
    public readonly AssignmentCount: number | undefined;
    /** Typ testu (test/ankieta) */
    public readonly Type: number;
    /** Opis testu */
    protected _Description: string | null;
    /** Sposób liczenia wyniku z podejść */
    protected _ScoreCounting: number;
    /** Tytuł na podziękowaniu za wypełnienie */
    protected _FinalTitle: string;
    /** Treść podziękowania za wypełnienie */
    protected _FinalText: string;
    /** Czy usunięto */
    protected _IsDeleted: boolean;

    /** Nazwa testu / ankiety */
    public get Name() {
        return this._Name;
    }
    public set Name(new_name: string) {
        this._Name = new_name;
        this.FireEvent('change');
    }

    /** Limit czasu na rozwiązanie testu */
    public get TimeLimit() {
        return this._TimeLimit;
    }
    public set TimeLimit(new_value: number) {
        this._TimeLimit = new_value;
        this.FireEvent('change');
    }

    /** Mnożnik pytań */
    public get QuestionMultiplier() {
        return this._QuestionMultiplier;
    }
    public set QuestionMultiplier(new_value: number) {
        this._QuestionMultiplier = new_value;
        this.FireEvent('change');
    }

    /** Ilość pytań (bez uwzględniania mnożnika) */
    public get QuestionCount() {
        return this._QuestionCount;
    }

    /** Opis testu / ankiety */
    public get Description() {
        return this._Description;
    }
    public set Description(new_description: string | null) {
        this._Description = new_description;
        this.FireEvent('change');
    }

    /** Sposób liczenia punktów */
    public get ScoreCounting() {
        return this._ScoreCounting;
    }
    public set ScoreCounting(new_value: number) {
        this._ScoreCounting = new_value;
        this.FireEvent('change');
    }

    /** Tytuł na podziękowaniu za wypełnienie */
    public get FinalTitle() {
        return this._FinalTitle;
    }
    public set FinalTitle(new_value: string) {
        this._FinalTitle = new_value;
        this.FireEvent('change');
    }

    /** Treść podziękowania za wypełnienie */
    public get FinalText() {
        return this._FinalText;
    }
    public set FinalText(new_value: string) {
        this._FinalText = new_value;
        this.FireEvent('change');
    }

    /** Czy test jest usunięty */
    public get IsDeleted() {
        return this._IsDeleted;
    }

    /** Obiekt odpowiedzialny za wczytywanie pytań do testu */
    protected QuestionLoader: QuestionLoader;
    /** Obiekt odpowiedzialny za wczytywanie przypisań */
    protected AssignmentLoader: () => Promise<Assignment[]>;

    /** Deskryptory przypisań tego testu */
    protected assignment_descriptors: AssignmentDescriptor[] | undefined;
    /** Przypisania */
    protected assignments: Assignment[] | undefined;

    /**
     * Klasa reprezentująca test
     * @param id Identyfikator testu
     * @param name Nazwa testu
     * @param author Autor testu
     * @param creation_date Data utworzenia testu
     * @param time_limit Limit czasu na rozwiązanie testu
     * @param question_multiplier Mnożnik pytań
     * @param question_loader Obiekt wczytujący pytania
     * @param assignment_loader Obiekt wczytujący przypisania
     */
    constructor(id: number, name: string, author: User, creation_date: Date, time_limit: number,
        question_multiplier: number, question_loader: QuestionLoader, assignment_count: number | undefined,
        assignment_loader: () => Promise<Assignment[]>, type: number, description: string | null,
        score_counting: number, final_title: string, final_text: string, is_deleted: boolean) {

        super();

        this.Id = id;
        this._Name = name;
        this.Author = author;
        this.CreationDate = creation_date;
        this._TimeLimit = time_limit;
        this._QuestionMultiplier = question_multiplier;
        this._QuestionCount = question_loader.QuestionCount;
        this.AssignmentCount = assignment_count;
        this.Type = type;
        this._Description = description;
        this._ScoreCounting = score_counting;
        this._FinalTitle = final_title;
        this._FinalText = final_text;
        this._IsDeleted = is_deleted;

        this.QuestionLoader = question_loader;
        this.AssignmentLoader = assignment_loader;
    }

    protected _Questions: Question[] | undefined;
    /** Zwraca pytania do tego testu */
    public async GetQuestions() {
        if(this._Questions === undefined) {
            this._Questions = await this.QuestionLoader.GetAllInCurrentTest();
        }
        return this._Questions;
    }

    protected _Assignments: Assignment[] | undefined;
    /** Zwraca przypisania do tego testu */
    public async GetAssignments() {
        if(this._Assignments === undefined) {
            this._Assignments = await this.AssignmentLoader();
        }
        return this._Assignments;
    }

    /** Dodaje przypisanie do testu, lokalnie */
    public AddAssignment(assignment: Assignment) {
        if(this._Assignments === undefined) this._Assignments = [];
        this._Assignments.push(assignment);
        this.FireEvent('change');
    }

    /** Czy test ma limit czasu na rozwiązanie */
    HasTimeLimit() {
        return this.TimeLimit != 0;
    }

    /**
     * Tworzy nowy test
     * @param name Nazwa testu
     * @param question_multiplier Mnożnik pytań
     * @param time_limit Limit czasu na rozwiązanie
     * @param type Typ testu (test/ankieta)
     */
    static async Create(name: string, question_multiplier: number, time_limit: number, type: number = Test.TYPE_TEST, loader = TestLoader.LoadById) {
        let request_data = {
            name: name,
            question_multiplier: question_multiplier,
            time_limit: time_limit,
            type: type
        };
        let result = await XHR.PerformRequest('api/tests', 'POST', request_data);

        if(result.Status != 201) throw result;

        return loader(parseInt(result.ContentLocation));
    }

    /** Usuwa test */
    async Remove() {
        let result = await XHR.PerformRequest(ApiEndpoints.GetEntityUrl(this), 'DELETE');
        if(result.Status == 204) {
            this._IsDeleted = true;
            this.FireEvent('remove');
        } else throw result;
    }

    /** Zwraca prostą reprezentację obiektu */
    GetSimpleRepresentation() {
        return {
            type: 'test',
            id: this.Id
        };
    }

    /** Zapewnia spójność danych po dodaniu pytania */
    OnQuestionAdded() {
        if(this._QuestionCount === undefined) this._QuestionCount = 0;
        this._QuestionCount++;
        this.FireEvent('change');
    }

    /** Zapewnia spójność danych po usunięciu pytania */
    OnQuestionRemoved() {
        if(this._QuestionCount === undefined || this._QuestionCount < 1) return;
        this._QuestionCount--;
        this.FireEvent('change');
    }
}
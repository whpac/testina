import * as XHR from '../utils/xhr';
import Entity, { Collection } from './entity';
import User from './user';
import PageParams from '../1page/pageparams';

import Question from './question';
import Assignment from './assignment';
import TestLoader from './loaders/testloader';
import QuestionLoader from './loaders/questionloader';
import AssignmentLoader, { AssignmentDescriptor } from './loaders/assignmentloader';

/** Klasa reprezentująca test */
export default class Test extends Entity implements PageParams {
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

    /** Nazwa testu */
    public get Name(){
        return this._Name;
    }
    public set Name(new_name: string){
        this._Name = new_name;
        this.FireEvent('change');
    }

    /** Limit czasu na rozwiązanie testu */
    public get TimeLimit(){
        return this._TimeLimit;
    }
    public set TimeLimit(new_value: number){
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
    public get QuestionCount(){
        return this._QuestionCount;
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
        assignment_loader: () => Promise<Assignment[]>){
        
        super();

        this.Id = id;
        this._Name = name;
        this.Author = author;
        this.CreationDate = creation_date;
        this._TimeLimit = time_limit;
        this._QuestionMultiplier = question_multiplier;
        this._QuestionCount = question_loader.QuestionCount;
        this.AssignmentCount = assignment_count;

        this.QuestionLoader = question_loader;
        this.AssignmentLoader = assignment_loader;
    }

    protected _Questions: Question[] | undefined;
    /** Zwraca pytania do tego testu */
    public async GetQuestions(){
        if(this._Questions === undefined){
            this._Questions = await this.QuestionLoader.GetAllInCurrentTest();
        }
        return this._Questions;
    }

    protected _Assignments: Assignment[] | undefined;
    /** Zwraca pytania do tego testu */
    public async GetAssignments(){
        if(this._Assignments === undefined){
            this._Assignments = await this.AssignmentLoader();
        }
        return this._Assignments;
    }

    /** Czy test ma limit czasu na rozwiązanie */
    HasTimeLimit(){
        return this.TimeLimit != 0;
    }

    /**
     * Tworzy nowy test
     * @param name Nazwa testu
     * @param question_multiplier Mnożnik pytań
     * @param time_limit Limit czasu na rozwiązanie
     */
    static async Create(name: string, question_multiplier: number, time_limit: number){
        let request_data = {
            name: name,
            question_multiplier: question_multiplier,
            time_limit: time_limit
        };
        let result = await XHR.Request('api/tests', 'POST', request_data);
        
        if(result.Status != 201) throw result;
        
        return TestLoader.LoadById(parseInt(result.ContentLocation));
    }

    /** Usuwa test */
    async Remove(){
        let result = await XHR.Request('api/tests/' + this.Id.toString(), 'DELETE');
        if(result.Status == 204){
            this.FireEvent('remove');
        }else throw result;
    }

    /** Zwraca prostą reprezentację obiektu */
    GetSimpleRepresentation(){
        return {
            type: 'test',
            id: this.Id
        };
    }

    /** Zapewnia spójność danych po dodaniu pytania */
    OnQuestionAdded(){
        if(this._QuestionCount === undefined) this._QuestionCount = 0;
        this._QuestionCount++;
        this.FireEvent('change');
    }

    /** Zapewnia spójność danych po usunięciu pytania */
    OnQuestionRemoved(){
        if(this._QuestionCount === undefined || this._QuestionCount < 1) return;
        this._QuestionCount--;
        this.FireEvent('change');
    }
}
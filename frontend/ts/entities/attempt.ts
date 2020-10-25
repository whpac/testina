import XHR from '../network/xhr';
import Entity from './entity';
import User from './user';
import Question from './question';
import Assignment from './assignment';
import QuestionWithUserAnswers from './question_with_user_answers';
import QuestionLoader, { QuestionDescriptor } from './loaders/questionloader';
import AttemptLoader, { AttemptDescriptor } from './loaders/attemptloader';
import ApiEndpoints from './loaders/apiendpoints';
import JsonBase64Deserializer from '../network/deserializers/jsonbase64_deserializer';
import PageParams, { SimpleObjectRepresentation } from '../1page/page_params';

/** Klasa reprezentująca podejście */
export default class Attempt extends Entity implements PageParams {
    /** Unikatowy identyfikator podejścia */
    public readonly Id: number;
    /** Przypisanie, do którego należy to podejście */
    public readonly Assignment: Assignment;
    /** Użytkownik, który wykonał podejście */
    public readonly User: User;
    /** Wynik punktowy w podejściu */
    public readonly Score: number | undefined;
    /** Maksymalny wynik punktowy w podejściu */
    public readonly MaxScore: number;
    /** Czas rozpoczęcia podejścia */
    public readonly BeginTime: Date;
    /** Ścieżka pytań (lista identyfikatorów) */
    public readonly Path: number[] | undefined;

    /** Obiekt wczytujący pytania */
    protected QuestionLoader: QuestionLoader | undefined;

    /**
     * Klasa reprezentująca podejście
     * @param assignment Przypisanie, którego częścią jest podejście
     * @param attempt Identyfikator podejścia lub deskryptor
     */
    constructor(id: number, assignment: Assignment, user: User, score: number | undefined,
        max_score: number, begin_time: Date, path: number[] | undefined, question_loader: QuestionLoader | undefined) {
        super();

        this.Id = id;
        this.Assignment = assignment;
        this.User = user;
        this.Score = score;
        this.MaxScore = max_score;
        this.BeginTime = begin_time;
        this.Path = path;
        this.QuestionLoader = question_loader;
    }

    /** Zwraca wynik procentowy uzyskany w podejściu */
    public GetPercentageScore() {
        if(this.Score === undefined || this.MaxScore === undefined) return 0;
        if(this.MaxScore == 0) return 0;

        return Math.round(100 * this.Score / this.MaxScore);
    }

    protected _Questions: Question[] | undefined;
    /** Zwraca pytania według ścieżki */
    async GetQuestions(): Promise<Question[]> {
        if(this._Questions !== undefined) return this._Questions;
        if(this.QuestionLoader === undefined || this.Path === undefined) throw 'Obiekt Attempt nie posiada danych do utworzenia ścieżki pytań.';

        let questions: Question[] = [];
        for(const q_id of this.Path) {
            questions.push(await this.QuestionLoader.LoadById(q_id));
        };
        this._Questions = questions;

        return questions;
    }

    /**
     * Tworzy nowe podejście
     * @param assignment Przypisanie, do którego należy utworzyć podejście
     */
    static async Create(assignment: Assignment) {
        let response = await XHR.PerformRequest(ApiEndpoints.GetEntityUrl(assignment) + '/attempts?depth=8', {
            Method: 'POST',
            ResponseDeserializer: new JsonBase64Deserializer()
        });
        let json = response.Response as AttemptDescriptor;
        return AttemptLoader.CreateFromDescriptor(assignment, json);
    }

    /**
     * Zapisuje odpowiedzi użytkownika
     * @param questions Pytania z odpowiedziami
     */
    async SaveUserAnswers(questions: QuestionWithUserAnswers[]) {
        let data: SaveUserAnswersPayload = {
            questions: []
        };

        for(let question of questions) {
            let answers: AnswersArray = [];
            let q = {
                id: question.GetQuestion().Id,
                done: question.GetIsDone(),
                is_open: (question.GetQuestion().Type == Question.TYPE_OPEN_ANSWER),
                answers: answers
            };

            if(question.UserSuppliedAnswer !== undefined) {
                q.answers.push({
                    text: question.UserSuppliedAnswer
                });
            }
            let selected_answers = question.GetSelectedAnswers();
            for(let selected_answer of selected_answers) {
                q.answers.push({
                    id: selected_answer.Id
                });
            }

            if(question.IsNonApplicableSelected) {
                q.answers.push({
                    id: -1
                });
            }

            data.questions.push(q);
        }

        let response = await XHR.PerformRequest('api/assignments/' + this.Assignment.Id + '/attempts/' + this.Id.toString() + '/answers', 'POST', data);

        if(response.Status != 201) {
            throw 'Nie udało się zapisać odpowiedzi.';
        }
    }

    GetSimpleRepresentation(): SimpleObjectRepresentation {
        return {
            type: 'attempt',
            id: this.Id
        };
    }
}

/** Typ reprezentujący treść żądania zapisania odpowiedzi użytkownika */
type SaveUserAnswersPayload = {
    questions: {
        id: number;
        done: boolean;
        is_open: boolean;
        answers: AnswersArray;
    }[];
};

type AnswersArray = ({ id: number; } | { text: string; })[];
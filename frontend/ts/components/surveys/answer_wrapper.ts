import Component from '../basic/component';
import Question from '../../entities/question';
import Answer from '../../entities/answer';
import SurveyAnswerRow from './survey_answer_row';
import { MoveElement } from '../../utils/arrayutils';
import NavigationPrevention from '../../1page/navigation_prevention';

export default class AnswerWrapper extends Component {
    protected ListElement: HTMLUListElement;
    protected AddAnswerButton: HTMLButtonElement | undefined;
    protected AnswerPlaceholderWrapper: HTMLElement;
    protected OpenAnswerInput: HTMLInputElement | undefined;

    protected Question: Question | undefined;
    protected QuestionType: number | undefined;
    protected EditMode: boolean;
    protected Answers: Answer[] | undefined;
    protected AnswerRows: SurveyAnswerRow[];

    public constructor(edit_mode: boolean = false) {
        super();

        this.EditMode = edit_mode;
        this.AnswerRows = [];

        this.ListElement = document.createElement('ul');
        this.AppendChild(this.ListElement);
        this.ListElement.classList.add('survey-answer-wrapper');

        this.AnswerPlaceholderWrapper = document.createElement('li');
        this.AnswerPlaceholderWrapper.classList.add('no-hover');
        this.ListElement.appendChild(this.AnswerPlaceholderWrapper);
    }

    public async Populate(question: Question | undefined) {
        this.Question = question;
        this.QuestionType = question?.Type ?? Question.TYPE_SINGLE_CHOICE;
        let questions_with_provided_answers = [Question.TYPE_SINGLE_CHOICE, Question.TYPE_MULTI_CHOICE];

        if(question !== undefined && this.QuestionType in questions_with_provided_answers) this.Answers = (await question.GetAnswers()).slice();
        else this.Answers = [];

        this.Answers.sort((a, b) => a.Order - b.Order);

        this.RenderAnswers();
    }

    public ChangeType(type: number) {
        this.QuestionType = type;
        this.RenderAnswers();
    }

    public SetQuestion(question: Question) {
        this.Question = question;
    }

    protected RenderAnswers() {
        if(this.Answers !== undefined) {
            if(this.AnswerRows.length == 0) {
                for(let i = 0; i < this.Answers.length; i++) {
                    let answer = this.Answers[i];
                    if(this.QuestionType == Question.TYPE_SINGLE_CHOICE
                        || this.QuestionType == Question.TYPE_MULTI_CHOICE) {
                        this.RenderClosedAnswer(answer);
                    }
                }
            } else {
                for(let answer_row of this.AnswerRows) {
                    answer_row.SetQuestionType(this.QuestionType ?? Question.TYPE_SINGLE_CHOICE);
                }
            }
        }

        if((this.QuestionType == Question.TYPE_SINGLE_CHOICE
            || this.QuestionType == Question.TYPE_MULTI_CHOICE)
            && this.EditMode) {
            this.AnswerPlaceholderWrapper.textContent = '';
            this.OpenAnswerInput = undefined;
            this.RenderAddAnswerButton();
            this.RefreshAnswerOrder();
        } else {
            this.RemoveAddAnswerButton();
        }

        if(this.QuestionType == Question.TYPE_OPEN_ANSWER) {
            this.RenderOpenAnswer();
        }
    }

    protected RefreshAnswerOrder() {
        for(let i = 0; i < this.AnswerRows.length; i++) {
            this.AnswerRows[i].IsFirst = (i == 0);
            this.AnswerRows[i].IsLast = (i == this.AnswerRows.length - 1);
        }

        for(let card of this.AnswerRows) {
            card.IsFirst = card.IsLast = false;
        }

        for(let i = 0; i < this.AnswerRows.length; i++) {
            if(this.AnswerRows[i].IsDeleted) continue;
            this.AnswerRows[i].IsFirst = true;
            break;
        }

        for(let i = this.AnswerRows.length - 1; i >= 0; i--) {
            if(this.AnswerRows[i].IsDeleted) continue;
            this.AnswerRows[i].IsLast = true;
            break;
        }
    }

    protected RenderClosedAnswer(answer: Answer | undefined) {
        let answer_row = new SurveyAnswerRow(this.EditMode);
        answer_row.Populate(this.Question, this.QuestionType ?? Question.TYPE_SINGLE_CHOICE, answer);
        answer_row.AddEventListener('moveup', (() => this.OnAnswerMovedUp(answer_row)).bind(this));
        answer_row.AddEventListener('movedown', (() => this.OnAnswerMovedDown(answer_row)).bind(this));
        answer_row.AddEventListener('markasdeleted', this.RefreshAnswerOrder.bind(this));
        answer_row.AddEventListener('markasundeleted', this.RefreshAnswerOrder.bind(this));
        this.ListElement.appendChild(answer_row.GetElement());
        this.AnswerRows.push(answer_row);

        if(this.AnswerRows.length >= 2) {
            let prev = this.AnswerRows[this.AnswerRows.length - 2];
            prev.NextRow = answer_row;
            answer_row.PreviousRow = prev;
        }
    }

    protected RenderOpenAnswer() {
        this.OpenAnswerInput = document.createElement('input');
        this.OpenAnswerInput.type = 'text';
        if(!this.EditMode) this.OpenAnswerInput.placeholder = 'Wpisz odpowiedź';
        else this.OpenAnswerInput.placeholder = 'Tu użytkownik wpisze odpowiedź';
        this.OpenAnswerInput.disabled = this.EditMode;
        this.AnswerPlaceholderWrapper.appendChild(this.OpenAnswerInput);
    }

    protected RenderAddAnswerButton() {
        if(this.AddAnswerButton !== undefined) return;

        this.AddAnswerButton = document.createElement('button');
        this.AddAnswerButton.classList.add('survey-add-answer-button');
        this.AddAnswerButton.textContent = 'Dodaj odpowiedź';
        this.AddAnswerButton.addEventListener('click', this.AddNewAnswer.bind(this));
        this.AppendChild(this.AddAnswerButton);
    }

    protected RemoveAddAnswerButton() {
        if(this.AddAnswerButton === undefined) return;

        this.AddAnswerButton.remove();
        this.AddAnswerButton = undefined;
    }

    protected OnAnswerMovedUp(answer_row: SurveyAnswerRow) {
        if(answer_row.PreviousRow === null) return;

        let former_prev = answer_row.PreviousRow;
        let new_prev = former_prev.PreviousRow;
        let former_next = answer_row.NextRow;

        if(new_prev !== null) new_prev.NextRow = answer_row;
        former_prev.PreviousRow = answer_row;
        former_prev.NextRow = former_next;
        answer_row.PreviousRow = new_prev;
        answer_row.NextRow = former_prev;
        if(former_next !== null) former_next.PreviousRow = former_prev;

        for(let i = 0; i < this.AnswerRows.length; i++) {
            if(answer_row == this.AnswerRows[i]) {
                MoveElement(this.AnswerRows, i, i - 1);
                break;
            }
        }

        this.RefreshAnswerOrder();
        NavigationPrevention.Prevent('survey-editor');
    }

    protected OnAnswerMovedDown(answer_row: SurveyAnswerRow) {
        if(answer_row.NextRow === null) return;

        let former_prev = answer_row.PreviousRow;
        let former_next = answer_row.NextRow;
        let new_next = former_next.NextRow;

        if(former_prev !== null) former_prev.NextRow = former_next;
        answer_row.PreviousRow = former_next;
        answer_row.NextRow = new_next;
        former_next.PreviousRow = former_prev;
        former_next.NextRow = answer_row;
        if(new_next !== null) new_next.PreviousRow = answer_row;

        for(let i = 0; i < this.AnswerRows.length; i++) {
            if(answer_row == this.AnswerRows[i]) {
                MoveElement(this.AnswerRows, i, i + 1);
                break;
            }
        }

        this.RefreshAnswerOrder();
        NavigationPrevention.Prevent('survey-editor');
    }

    protected AddNewAnswer() {
        this.RenderClosedAnswer(undefined);
        this.RefreshAnswerOrder();
        NavigationPrevention.Prevent('survey-editor');
    }

    public async Save() {
        let order = 0;
        let save_awaiters: Promise<void>[] = [];

        for(let answer_row of this.AnswerRows) {
            if(!answer_row.IsDeleted) order++;
            if(this.Question !== undefined) answer_row.SetQuestion(this.Question);
            save_awaiters.push(answer_row.Save(order));
        }
        for(let awaiter of save_awaiters) await awaiter;
    }

    public GetUserAnswers() {
        if(this.OpenAnswerInput !== undefined) {
            return this.OpenAnswerInput.value.trim();
        }

        let answers = [];
        for(let answer of this.AnswerRows) {
            answers[answer.GetAnswerId()] = answer.IsSelected();
        }
        return answers;
    }
}
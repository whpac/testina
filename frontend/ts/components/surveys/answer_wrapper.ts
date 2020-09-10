import Component from '../basic/component';
import Question from '../../entities/question';
import Answer from '../../entities/answer';
import SurveyAnswerRow from './survey_answer_row';
import { MoveElement } from '../../utils/arrayutils';

export default class AnswerWrapper extends Component {
    protected ListElement: HTMLUListElement;
    protected AddAnswerButton: HTMLButtonElement | undefined;
    protected AnswerPlaceholderWrapper: HTMLElement;

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

    public async Populate(question: Question) {
        this.Question = question;
        this.QuestionType = question.Type;
        this.Answers = (await question.GetAnswers()).slice();
        this.RenderAnswers();
    }

    public ChangeType(type: number) {
        this.QuestionType = type;
        this.RenderAnswers();
    }

    protected RenderAnswers() {
        //this.ListElement.textContent = '';

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
                    answer_row.SetQuestionType(this.QuestionType ?? 0);
                }
            }
        }

        if((this.QuestionType == Question.TYPE_SINGLE_CHOICE
            || this.QuestionType == Question.TYPE_MULTI_CHOICE)
            && this.EditMode) {
            this.AnswerPlaceholderWrapper.textContent = '';
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
    }

    protected RenderClosedAnswer(answer: Answer | undefined) {
        if(this.Question === undefined) return;

        let answer_row = new SurveyAnswerRow(this.EditMode);
        answer_row.Populate(this.Question, this.QuestionType ?? 0, answer);
        answer_row.AddEventListener('moveup', (() => this.OnAnswerMovedUp(answer_row)).bind(this));
        answer_row.AddEventListener('movedown', (() => this.OnAnswerMovedDown(answer_row)).bind(this));
        this.ListElement.appendChild(answer_row.GetElement());
        this.AnswerRows.push(answer_row);

        if(this.AnswerRows.length >= 2) {
            let prev = this.AnswerRows[this.AnswerRows.length - 2];
            prev.NextRow = answer_row;
            answer_row.PreviousRow = prev;
        }
    }

    protected RenderOpenAnswer() {
        let input = document.createElement('input');
        input.type = 'text';
        if(!this.EditMode) input.placeholder = 'Wpisz odpowiedź';
        else input.placeholder = 'Tu użytkownik wpisze odpowiedź';
        input.disabled = this.EditMode;
        this.AnswerPlaceholderWrapper.appendChild(input);
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

        answer_row.IsFirst = (answer_row.PreviousRow === null);
        answer_row.IsLast = false;
        former_prev.IsFirst = false;
        former_prev.IsLast = (former_next === null);

        for(let i = 0; i < this.AnswerRows.length; i++) {
            if(answer_row == this.AnswerRows[i]) {
                MoveElement(this.AnswerRows, i, i - 1);
                break;
            }
        }
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

        answer_row.IsFirst = false;
        answer_row.IsLast = (answer_row.NextRow === null);
        former_next.IsFirst = (former_prev === null);
        former_next.IsLast = false;

        for(let i = 0; i < this.AnswerRows.length; i++) {
            if(answer_row == this.AnswerRows[i]) {
                MoveElement(this.AnswerRows, i, i + 1);
                break;
            }
        }
    }

    protected AddNewAnswer() {
        this.RenderClosedAnswer(undefined);
        this.RefreshAnswerOrder();
    }
}
import Component from '../basic/component';
import Answer from '../../entities/answer';
import Icon from '../basic/icon';
import { Hash } from '../../utils/textutils';
import Question from '../../entities/question';

export default class SurveyAnswerRow extends Component<"moveup" | "movedown"> {
    protected QuestionType: number | undefined;
    protected Answer: Answer | undefined;
    protected _IsFirst: boolean = false;
    protected _IsLast: boolean = false;

    protected Element: HTMLLIElement;
    protected CheckboxElement: HTMLInputElement;
    protected AnswerTextElement: HTMLLabelElement | HTMLInputElement;
    protected MoveUpButton: HTMLButtonElement | undefined;
    protected MoveDownButton: HTMLButtonElement | undefined;

    public PreviousRow: SurveyAnswerRow | null;
    public NextRow: SurveyAnswerRow | null;

    public get IsFirst() {
        return this._IsFirst;
    }
    public set IsFirst(value: boolean) {
        this._IsFirst = value;
        if(this.MoveUpButton !== undefined)
            this.MoveUpButton.disabled = value;
    }

    public get IsLast() {
        return this._IsLast;
    }
    public set IsLast(value: boolean) {
        this._IsLast = value;
        if(this.MoveDownButton !== undefined)
            this.MoveDownButton.disabled = value;
    }

    public constructor(edit_mode: boolean = false) {
        super();

        this.Element = document.createElement('li');
        if(!edit_mode) this.Element.classList.add('no-hover');

        this.PreviousRow = null;
        this.NextRow = null;

        this.CheckboxElement = document.createElement('input');
        this.CheckboxElement.disabled = edit_mode;
        this.CheckboxElement.id = 'cb_' + Math.random().toString(16).substr(2);
        this.AppendChild(this.CheckboxElement);

        if(edit_mode) {
            let input = document.createElement('input');
            input.classList.add('discreet');
            input.type = 'text';
            input.placeholder = 'Podaj treść odpowiedzi';
            this.AppendChild(input);
            this.AnswerTextElement = input;

            let control_buttons = document.createElement('div');
            this.AppendChild(control_buttons);
            control_buttons.classList.add('control-buttons');

            this.MoveUpButton = document.createElement('button');
            this.MoveUpButton.classList.add('secondary', 'control-button');
            this.MoveUpButton.appendChild(new Icon('arrow-up').GetElement());
            this.MoveUpButton.title = 'Przenieś wyżej';
            this.MoveUpButton.addEventListener('click', this.MoveUp.bind(this));
            control_buttons.appendChild(this.MoveUpButton);

            this.MoveDownButton = document.createElement('button');
            this.MoveDownButton.classList.add('secondary', 'control-button');
            this.MoveDownButton.appendChild(new Icon('arrow-down').GetElement());
            this.MoveDownButton.title = 'Przenieś niżej';
            this.MoveDownButton.addEventListener('click', this.MoveDown.bind(this));
            control_buttons.appendChild(this.MoveDownButton);

            let btn_remove = document.createElement('button');
            btn_remove.classList.add('error', 'control-button');
            btn_remove.appendChild(new Icon('trash').GetElement());
            btn_remove.title = 'Usuń odpowiedź';
            control_buttons.appendChild(btn_remove);
        } else {
            this.AnswerTextElement = document.createElement('label');
            this.AnswerTextElement.htmlFor = this.CheckboxElement.id;
            this.AnswerTextElement.classList.add('text');
            this.AppendChild(this.AnswerTextElement);
        }
    }

    public Populate(question: Question | undefined, question_type: number, answer: Answer | undefined) {
        this.QuestionType = question_type;
        this.Answer = answer;

        if(this.AnswerTextElement instanceof HTMLInputElement) {
            this.AnswerTextElement.value = answer?.Text ?? '';
        } else {
            this.AnswerTextElement.textContent = ' ' + answer?.Text ?? '';
        }

        this.CheckboxElement.type = this.QuestionType == Question.TYPE_SINGLE_CHOICE ? 'radio' : 'checkbox';
        this.CheckboxElement.name = Hash(question?.Text ?? '', question?.Id ?? 0).toString(16);
    }

    public SetQuestionType(question_type: number) {
        this.QuestionType = question_type;
        this.CheckboxElement.type = this.QuestionType == Question.TYPE_SINGLE_CHOICE ? 'radio' : 'checkbox';

        let visible_for_types = [Question.TYPE_SINGLE_CHOICE, Question.TYPE_MULTI_CHOICE];
        this.Element.style.display = visible_for_types.includes(this.QuestionType) ? '' : 'none';
    }

    protected MoveUp() {
        if(this.IsFirst) return;

        let prev_answer = this.Element.previousElementSibling;
        if(prev_answer === null) return;

        let ul = this.Element.parentElement;
        ul?.insertBefore(this.Element, prev_answer);
        this.FireEvent('moveup');
    }

    protected MoveDown() {
        if(this.IsLast) return;

        let next_answer = this.Element.nextElementSibling;
        if(next_answer === null) return;

        let ul = this.Element.parentElement;
        ul?.insertBefore(next_answer, this.Element);
        this.FireEvent('movedown');
    }
}
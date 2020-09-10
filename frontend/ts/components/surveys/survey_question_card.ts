import Card from '../basic/card';
import Question from '../../entities/question';
import { AutoGrow } from '../../utils/elementutils';
import AnswerWrapper from './answer_wrapper';
import Icon from '../basic/icon';

export default class SurveyQuestionCard extends Card<"moveup" | "movedown"> {
    protected EditMode: boolean;
    protected Question: Question | undefined;
    protected _IsFirst: boolean = false;
    protected _IsLast: boolean = false;

    protected QuestionNumberText: Text;
    protected QuestionTypeSelect: HTMLSelectElement | undefined;
    protected MoveUpButton: HTMLButtonElement | undefined;
    protected MoveDownButton: HTMLButtonElement | undefined;
    protected HeadingField: HTMLTextAreaElement | HTMLHeadingElement;
    protected FooterField: HTMLTextAreaElement | HTMLParagraphElement;
    protected AnswerWrapper: AnswerWrapper;

    public PreviousCard: SurveyQuestionCard | null;
    public NextCard: SurveyQuestionCard | null;

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
        this.EditMode = edit_mode;

        this.PreviousCard = null;
        this.NextCard = null;

        let question_header = document.createElement('div');
        question_header.classList.add('survey-question-header');
        this.AppendChild(question_header);
        question_header.style.marginBottom = '3px';
        question_header.textContent = 'Pytanie ';
        question_header.appendChild(this.QuestionNumberText = document.createTextNode('0'));
        if(edit_mode) {
            question_header.appendChild(document.createTextNode(': '));
            this.QuestionTypeSelect = document.createElement('select');
            question_header.appendChild(this.QuestionTypeSelect);
            this.QuestionTypeSelect.addEventListener('change', this.ChangeQuestionType.bind(this));

            let types: [number, string][] = [
                [Question.TYPE_SINGLE_CHOICE, 'Jednokrotnego wyboru'],
                [Question.TYPE_MULTI_CHOICE, 'Wielokrotnego wyboru'],
                [Question.TYPE_OPEN_ANSWER, 'Otwarte']
            ];

            for(let type of types) {
                let option = document.createElement('option');
                option.value = type[0].toString();
                option.textContent = type[1];
                this.QuestionTypeSelect.appendChild(option);
            }

            let buttons = document.createElement('span');
            buttons.classList.add('buttons');
            question_header.appendChild(buttons);

            this.MoveUpButton = document.createElement('button');
            buttons.appendChild(this.MoveUpButton);
            this.MoveUpButton.classList.add('secondary', 'control-button');
            this.MoveUpButton.appendChild(new Icon('arrow-up').GetElement());
            this.MoveUpButton.addEventListener('click', this.MoveUp.bind(this));
            this.MoveUpButton.title = 'Przenieś pytanie wcześniej';

            this.MoveDownButton = document.createElement('button');
            buttons.appendChild(this.MoveDownButton);
            this.MoveDownButton.classList.add('secondary', 'control-button');
            this.MoveDownButton.appendChild(new Icon('arrow-down').GetElement());
            this.MoveDownButton.addEventListener('click', this.MoveDown.bind(this));
            this.MoveDownButton.title = 'Przenieś pytanie dalej';

            let remove_btn = document.createElement('button');
            buttons.appendChild(remove_btn);
            remove_btn.classList.add('error');
            remove_btn.appendChild(new Icon('trash').GetElement());
            remove_btn.title = 'Usuń pytanie';
        } else {
            question_header.classList.add('secondary');
            question_header.appendChild(document.createTextNode('.'));
        }

        this.AnswerWrapper = new AnswerWrapper(this.EditMode);

        if(edit_mode) {
            let heading = document.createElement('textarea');
            heading.classList.add('heading', 'discreet', 'no-resize', 'one-line');
            heading.placeholder = 'Podaj treść pytania';
            AutoGrow(heading);
            this.HeadingField = heading;

            let footer = document.createElement('textarea');
            footer.classList.add('small', 'secondary', 'discreet', 'no-resize', 'full-width');
            footer.placeholder = 'Tekst wyświetlany w stopce pod pytaniem (opcjonalnie)';
            AutoGrow(footer);
            this.FooterField = footer;
        } else {
            this.HeadingField = document.createElement('h2');
            this.FooterField = document.createElement('p');
        }
        this.AppendChild(this.HeadingField);
        this.AppendChild(this.AnswerWrapper);
        this.AppendChild(this.FooterField);
    }

    public Populate(question: Question, question_number: number) {
        this.SetNumber(question_number);

        if(this.HeadingField instanceof HTMLInputElement) {
            this.HeadingField.value = question.Text;
        } else {
            this.HeadingField.textContent = question.Text;
        }

        if(this.QuestionTypeSelect !== undefined)
            this.QuestionTypeSelect.value = question.Type.toString();
        this.AnswerWrapper.Populate(question);
    }

    public SetNumber(question_number: number) {
        this.QuestionNumberText.textContent = question_number.toString();
    }

    protected ChangeQuestionType() {
        if(this.QuestionTypeSelect === undefined) return;
        this.AnswerWrapper.ChangeType(parseInt(this.QuestionTypeSelect.value));
    }

    protected MoveUp() {
        let prev_question = this.Element.previousElementSibling;
        if(prev_question === null) return;
        let parent = this.Element.parentElement;
        parent?.insertBefore(this.Element, prev_question);
        this.FireEvent('moveup');
    }

    protected MoveDown() {
        let next_question = this.Element.nextElementSibling;
        if(next_question === null) return;
        let parent = this.Element.parentElement;
        parent?.insertBefore(next_question, this.Element);
        this.FireEvent('movedown');
    }
}
import Component from '../basic/component';
import Answer from '../../entities/answer';
import Icon from '../basic/icon';
import { Hash } from '../../utils/textutils';
import Question from '../../entities/question';
import NavigationPrevention from '../../1page/navigation_prevention';

export default class SurveyAnswerRow extends Component<"moveup" | "movedown" | "markasdeleted" | "markasundeleted" | "checkedchange"> {
    protected QuestionType: number | undefined;
    protected Question: Question | undefined;
    protected Answer: Answer | undefined;
    protected _IsFirst: boolean = false;
    protected _IsLast: boolean = false;
    protected _IsDeleted: boolean = false;
    protected EditMode: boolean;

    protected Element: HTMLLIElement;
    protected CheckboxElement: HTMLInputElement;
    protected AnswerTextElement: HTMLLabelElement | HTMLInputElement;
    protected ControlButtonsWrapper: HTMLElement | undefined;
    protected MoveUpButton: HTMLButtonElement | undefined;
    protected MoveDownButton: HTMLButtonElement | undefined;
    protected RemoveButton: HTMLButtonElement | undefined;
    protected RestoreButton: HTMLButtonElement | undefined;

    public PreviousRow: SurveyAnswerRow | null;
    public NextRow: SurveyAnswerRow | null;

    public get IsFirst() {
        return this._IsFirst;
    }
    public set IsFirst(value: boolean) {
        this._IsFirst = value;
        this.UpdateMoveButtonsState();
    }

    public get IsLast() {
        return this._IsLast;
    }
    public set IsLast(value: boolean) {
        this._IsLast = value;
        this.UpdateMoveButtonsState();
    }

    public get IsDeleted() {
        return this._IsDeleted;
    }

    public constructor(edit_mode: boolean = false) {
        super();
        this.EditMode = edit_mode;

        this.Element = document.createElement('li');
        if(!edit_mode) this.Element.classList.add('no-hover');

        this.PreviousRow = null;
        this.NextRow = null;

        this.CheckboxElement = document.createElement('input');
        this.CheckboxElement.disabled = edit_mode;
        this.CheckboxElement.id = 'cb_' + Math.random().toString(16).substr(2);
        this.CheckboxElement.addEventListener('change', (() => this.FireEvent('checkedchange')).bind(this));
        this.AppendChild(this.CheckboxElement);

        if(edit_mode) {
            let input = document.createElement('input');
            input.classList.add('discreet');
            input.type = 'text';
            input.placeholder = 'Podaj treść odpowiedzi';
            input.addEventListener('change', () => NavigationPrevention.Prevent('survey-editor'));
            this.AppendChild(input);
            this.AnswerTextElement = input;

            this.ControlButtonsWrapper = document.createElement('div');
            this.AppendChild(this.ControlButtonsWrapper);
            this.ControlButtonsWrapper.classList.add('control-buttons');

            this.MoveUpButton = document.createElement('button');
            this.MoveUpButton.classList.add('secondary', 'control-button');
            this.MoveUpButton.appendChild(new Icon('arrow-up', 'fa-fw').GetElement());
            this.MoveUpButton.title = 'Przenieś wyżej';
            this.MoveUpButton.addEventListener('click', this.MoveUp.bind(this));
            this.ControlButtonsWrapper.appendChild(this.MoveUpButton);

            this.MoveDownButton = document.createElement('button');
            this.MoveDownButton.classList.add('secondary', 'control-button');
            this.MoveDownButton.appendChild(new Icon('arrow-down', 'fa-fw').GetElement());
            this.MoveDownButton.title = 'Przenieś niżej';
            this.MoveDownButton.addEventListener('click', this.MoveDown.bind(this));
            this.ControlButtonsWrapper.appendChild(this.MoveDownButton);

            this.RemoveButton = document.createElement('button');
            this.RemoveButton.classList.add('error', 'control-button');
            this.RemoveButton.appendChild(new Icon('trash', 'fa-fw').GetElement());
            this.RemoveButton.title = 'Usuń odpowiedź';
            this.RemoveButton.addEventListener('click', this.Delete.bind(this));
            this.ControlButtonsWrapper.appendChild(this.RemoveButton);

            this.RestoreButton = document.createElement('button');
            this.RestoreButton.classList.add('control-button');
            this.RestoreButton.appendChild(new Icon('undo', 'fa-fw').GetElement());
            this.RestoreButton.title = 'Przywróć odpowiedź';
            this.RestoreButton.style.display = 'none';
            this.RestoreButton.addEventListener('click', this.Undelete.bind(this));
            this.ControlButtonsWrapper.appendChild(this.RestoreButton);
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

    public SetQuestion(question: Question) {
        this.Question = question;
    }

    public SetQuestionType(question_type: number) {
        this.QuestionType = question_type;
        this.CheckboxElement.type = this.QuestionType == Question.TYPE_SINGLE_CHOICE ? 'radio' : 'checkbox';

        let visible_for_types = [Question.TYPE_SINGLE_CHOICE, Question.TYPE_MULTI_CHOICE];
        this.Element.style.display = visible_for_types.includes(this.QuestionType) ? '' : 'none';
    }

    protected UpdateMoveButtonsState() {
        if(this.MoveDownButton === undefined || this.MoveUpButton === undefined) return;

        this.MoveDownButton.disabled = this.IsLast || this.IsDeleted;
        this.MoveUpButton.disabled = this.IsFirst || this.IsDeleted;

        this.MoveDownButton.style.opacity = this.IsDeleted ? '0' : '';
        this.MoveUpButton.style.opacity = this.IsDeleted ? '0' : '';
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

    protected Delete() {
        if(this.RemoveButton === undefined || this.RestoreButton === undefined) return;
        this._IsDeleted = true;
        this.RemoveButton.style.display = 'none';
        this.RestoreButton.style.display = '';
        this.Element.classList.add('deleted');
        this.UpdateMoveButtonsState();
        this.FireEvent('markasdeleted');
        NavigationPrevention.Prevent('survey-editor');
    }

    protected Undelete() {
        if(this.RemoveButton === undefined || this.RestoreButton === undefined) return;
        this._IsDeleted = false;
        this.RemoveButton.style.display = '';
        this.RestoreButton.style.display = 'none';
        this.Element.classList.remove('deleted');
        this.UpdateMoveButtonsState();
        this.FireEvent('markasundeleted');
        NavigationPrevention.Prevent('survey-editor');
    }

    public async Save(order: number) {
        if(this.Question === undefined) return;
        if(!('value' in this.AnswerTextElement)) return;

        if(this.Answer !== undefined) {
            if(!this.IsDeleted) {
                // Zaktualizuj pytanie
                let update_awaiter = this.Answer.Update(
                    this.AnswerTextElement.value,
                    false,
                    order
                );
                await update_awaiter;
            } else {
                // Usuń pytanie
                let remove_awaiter = this.Answer.Remove();
                // Zniszczyć ten wiersz
                this.Answer = undefined;
                this.GetElement().style.display = 'none';

                return remove_awaiter;
            }
        } else {
            if(!this.IsDeleted) {
                // Utwórz pytanie
                let answer_creator = Answer.Create(
                    this.Question,
                    this.AnswerTextElement.value,
                    false,
                    order
                );
                this.Answer = await answer_creator;
            } else {
                // Zniszczyć ten wiersz
                this.GetElement().style.display = 'none';
            }
        }
    }

    public GetValue(): boolean | string {
        return this.CheckboxElement.checked;
    }

    public GetAnswerId(): number | undefined {
        return this.Answer?.Id ?? undefined;
    }

    public OnSelectionChanged() {

    }
}
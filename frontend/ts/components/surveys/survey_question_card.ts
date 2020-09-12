import Card from '../basic/card';
import Question from '../../entities/question';
import { AutoGrow } from '../../utils/elementutils';
import AnswerWrapper from './answer_wrapper';
import Icon from '../basic/icon';
import NavigationPrevention from '../../1page/navigation_prevention';
import Test from '../../entities/test';

export default class SurveyQuestionCard extends Card<"moveup" | "movedown" | "markasdeleted" | "markasundeleted"> {
    protected EditMode: boolean;
    protected Question: Question | undefined;
    protected Survey: Test | undefined;
    protected _IsFirst: boolean = false;
    protected _IsLast: boolean = false;
    protected _IsDeleted: boolean = false;

    protected QuestionNumberText: Text;
    protected QuestionTypeSelect: HTMLSelectElement | undefined;
    protected MoveUpButton: HTMLButtonElement | undefined;
    protected MoveDownButton: HTMLButtonElement | undefined;
    protected RemoveButton: HTMLButtonElement | undefined;
    protected RestoreButton: HTMLButtonElement | undefined;
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
        super('survey-question-card');
        this.EditMode = edit_mode;

        this.PreviousCard = null;
        this.NextCard = null;

        let question_header = document.createElement('div');
        question_header.classList.add('survey-question-header');
        this.AppendChild(question_header);
        question_header.style.marginBottom = '3px';
        question_header.textContent = 'Pytanie';
        question_header.appendChild(this.QuestionNumberText = document.createTextNode(' 0'));
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
            this.MoveUpButton.classList.add('secondary');
            this.MoveUpButton.appendChild(new Icon('arrow-up', 'fa-fw').GetElement());
            this.MoveUpButton.addEventListener('click', this.MoveUp.bind(this));
            this.MoveUpButton.title = 'Przenieś pytanie wcześniej';

            this.MoveDownButton = document.createElement('button');
            buttons.appendChild(this.MoveDownButton);
            this.MoveDownButton.classList.add('secondary');
            this.MoveDownButton.appendChild(new Icon('arrow-down', 'fa-fw').GetElement());
            this.MoveDownButton.addEventListener('click', this.MoveDown.bind(this));
            this.MoveDownButton.title = 'Przenieś pytanie dalej';

            this.RemoveButton = document.createElement('button');
            buttons.appendChild(this.RemoveButton);
            this.RemoveButton.classList.add('error');
            this.RemoveButton.appendChild(new Icon('trash', 'fa-fw').GetElement());
            this.RemoveButton.addEventListener('click', this.Delete.bind(this));
            this.RemoveButton.title = 'Usuń pytanie';

            this.RestoreButton = document.createElement('button');
            buttons.appendChild(this.RestoreButton);
            this.RestoreButton.appendChild(new Icon('undo', 'fa-fw').GetElement());
            this.RestoreButton.addEventListener('click', this.Undelete.bind(this));
            this.RestoreButton.title = 'Przywróć pytanie';
            this.RestoreButton.style.display = 'none';
        } else {
            question_header.classList.add('secondary');
            question_header.appendChild(document.createTextNode('.'));
        }

        this.AnswerWrapper = new AnswerWrapper(this.EditMode);

        if(edit_mode) {
            let heading = document.createElement('textarea');
            heading.classList.add('heading', 'discreet', 'no-resize', 'one-line');
            heading.placeholder = 'Podaj treść pytania';
            heading.addEventListener('change', () => NavigationPrevention.Prevent('survey-editor'));
            AutoGrow(heading);
            this.HeadingField = heading;

            let footer = document.createElement('textarea');
            footer.classList.add('small', 'secondary', 'discreet', 'no-resize', 'full-width');
            footer.placeholder = 'Tekst wyświetlany w stopce pod pytaniem (opcjonalnie)';
            footer.addEventListener('change', () => NavigationPrevention.Prevent('survey-editor'));
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

    public Populate(question: Question | undefined, question_number: number) {
        this.SetNumber(question_number);
        this.Question = question;

        if(this.HeadingField instanceof HTMLTextAreaElement && this.FooterField instanceof HTMLTextAreaElement) {
            this.HeadingField.value = question?.Text ?? '';
            this.FooterField.value = question?.Footer ?? '';
        } else {
            this.HeadingField.textContent = question?.Text ?? '[Nie podano treści pytania]';
            this.FooterField.textContent = question?.Footer ?? '';
            this.FooterField.style.display = question?.Footer === null ? 'none' : '';
        }

        if(this.QuestionTypeSelect !== undefined)
            this.QuestionTypeSelect.value = (question?.Type ?? Question.TYPE_SINGLE_CHOICE).toString();
        this.AnswerWrapper.Populate(question);
    }

    public SetSurvey(survey: Test) {
        this.Survey = survey;
    }

    public SetNumber(question_number: number | null) {
        if(question_number === null) this.QuestionNumberText.textContent = '';
        else this.QuestionNumberText.textContent = ' ' + question_number.toString();
    }

    protected ChangeQuestionType() {
        if(this.QuestionTypeSelect === undefined) return;
        this.AnswerWrapper.ChangeType(parseInt(this.QuestionTypeSelect.value));
        NavigationPrevention.Prevent('survey-editor');
    }

    protected UpdateMoveButtonsState() {
        if(this.MoveDownButton === undefined || this.MoveUpButton === undefined) return;

        this.MoveDownButton.disabled = this.IsLast;
        this.MoveUpButton.disabled = this.IsFirst;

        this.MoveDownButton.style.display = this.IsDeleted ? 'none' : '';
        this.MoveUpButton.style.display = this.IsDeleted ? 'none' : '';
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

    protected Delete() {
        if(this.RemoveButton === undefined || this.RestoreButton === undefined) return;
        this._IsDeleted = true;
        this.RemoveButton.style.display = 'none';
        this.RestoreButton.style.display = '';
        this.Element.classList.add('deleted');
        this.SetNumber(null);
        this.UpdateMoveButtonsState();
        this.FireEvent('markasdeleted');
    }

    protected Undelete() {
        if(this.RemoveButton === undefined || this.RestoreButton === undefined) return;
        this._IsDeleted = false;
        this.RemoveButton.style.display = '';
        this.RestoreButton.style.display = 'none';
        this.Element.classList.remove('deleted');
        this.UpdateMoveButtonsState();
        this.FireEvent('markasundeleted');
    }

    /**
     * Zapisuje zmiany w pytaniu. Jeśli pytanie jest oznaczone jako
     * do usunięcia (IsDeleted = true), usuwa je.
     * @param order Numer kolejny pytania. Nie ma wpływu na pytania do usunięcia
     */
    public async Save(order: number) {
        if(this.Survey === undefined) return;
        if(!('value' in this.HeadingField)) return;
        if(!('value' in this.FooterField)) return;
        if(this.QuestionTypeSelect === undefined) return;

        if(this.Question !== undefined) {
            if(!this.IsDeleted) {
                // Zaktualizuj pytanie
                let update_awaiter = this.Question.Update(
                    this.HeadingField.value,
                    parseInt(this.QuestionTypeSelect.value),
                    0,
                    0,
                    0,
                    this.FooterField.value,
                    order
                );
                await this.SaveAnswers();
                await update_awaiter;
            } else {
                // Usuń pytanie
                return this.Question.Remove();
                // Zniszczyć tę kartę
            }
        } else {
            if(!this.IsDeleted) {
                // Utwórz pytanie
                let question_creator = Question.Create(
                    this.Survey,
                    this.HeadingField.value,
                    parseInt(this.QuestionTypeSelect.value),
                    0,
                    0,
                    0,
                    this.FooterField.value,
                    order
                );
                await this.SaveAnswers();
                this.Question = await question_creator;
            } else {
                // Zniszczyć tę kartę
            }
        }
    }

    protected async SaveAnswers() {

    }
}
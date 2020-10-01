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
    protected _IsOptional: boolean = false;

    protected QuestionNumberText: Text;
    protected QuestionTypeSelect: HTMLSelectElement | undefined;
    protected MarkAsOptionalButton: HTMLButtonElement | undefined;
    protected MarkAsRequiredButton: HTMLButtonElement | undefined;
    protected RequiredIndicator: HTMLElement | undefined;
    protected MoveUpButton: HTMLButtonElement | undefined;
    protected MoveDownButton: HTMLButtonElement | undefined;
    protected RemoveButton: HTMLButtonElement | undefined;
    protected RestoreButton: HTMLButtonElement | undefined;
    protected HeadingField: HTMLTextAreaElement | HTMLHeadingElement;
    protected FooterField: HTMLTextAreaElement | HTMLParagraphElement;
    protected AnswerWrapper: AnswerWrapper;
    protected ErrorNotice: HTMLParagraphElement;

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
                [Question.TYPE_OPEN_ANSWER, 'Otwarte'],
                [Question.TYPE_RANGE, 'O liczbę z zakresu']
            ];

            for(let type of types) {
                let option = document.createElement('option');
                option.value = type[0].toString();
                option.textContent = type[1];
                this.QuestionTypeSelect.appendChild(option);
            }

            this.MarkAsOptionalButton = document.createElement('button');
            question_header.appendChild(this.MarkAsOptionalButton);
            this.MarkAsOptionalButton.classList.add('compact', 'error');
            this.MarkAsOptionalButton.appendChild(new Icon('asterisk', 'fa-fw').GetElement());
            this.MarkAsOptionalButton.title = 'Pytanie jest wymagane. Kliknij, by zmienić';
            this.MarkAsOptionalButton.addEventListener('click', this.MarkAsOptional.bind(this));

            this.MarkAsRequiredButton = document.createElement('button');
            question_header.appendChild(this.MarkAsRequiredButton);
            this.MarkAsRequiredButton.classList.add('compact', 'success');
            this.MarkAsRequiredButton.appendChild(new Icon('dot-circle-o', 'fa-fw').GetElement());
            this.MarkAsRequiredButton.title = 'Pytanie nie jest wymagane. Kliknij, by zmienić';
            this.MarkAsRequiredButton.addEventListener('click', this.MarkAsRequired.bind(this));

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

            this.RequiredIndicator = document.createElement('span');
            question_header.appendChild(this.RequiredIndicator);
            this.RequiredIndicator.classList.add('error');
            this.RequiredIndicator.textContent = '*';
        }

        this.AnswerWrapper = new AnswerWrapper(this.EditMode);
        this.ErrorNotice = document.createElement('p');
        this.ErrorNotice.classList.add('error-message');

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
            this.FooterField.classList.add('small-margin', 'secondary');
        }
        this.AppendChild(this.HeadingField);
        this.AppendChild(this.AnswerWrapper);
        this.AppendChild(this.ErrorNotice);
        this.AppendChild(this.FooterField);
    }

    public Populate(question: Question | undefined, question_number: number) {
        this.SetNumber(question_number);
        this.Question = question;

        if(this.HeadingField instanceof HTMLTextAreaElement && this.FooterField instanceof HTMLTextAreaElement) {
            this.HeadingField.value = question?.Text ?? '';
            this.FooterField.value = question?.Footer ?? '';
        } else {
            let rows = (question?.Text ?? '[Nie podano treści pytania]').split('\n');
            this.HeadingField.textContent = '';

            for(let i = 0; i < rows.length; i++) {
                if(i != 0) this.HeadingField.appendChild(document.createElement('br'));
                this.HeadingField.appendChild(document.createTextNode(rows[i]));
            }

            rows = (question?.Footer ?? '').split('\n');
            this.FooterField.textContent = '';

            for(let i = 0; i < rows.length; i++) {
                if(i != 0) this.FooterField.appendChild(document.createElement('br'));
                this.FooterField.appendChild(document.createTextNode(rows[i]));
            }
            this.FooterField.style.display = question?.Footer === null ? 'none' : '';
        }

        if(this.QuestionTypeSelect !== undefined)
            this.QuestionTypeSelect.value = (question?.Type ?? Question.TYPE_SINGLE_CHOICE).toString();
        if(this.MarkAsOptionalButton !== undefined)
            this.MarkAsOptionalButton.style.display = (question?.IsOptional ?? false) ? 'none' : '';
        if(this.MarkAsRequiredButton !== undefined)
            this.MarkAsRequiredButton.style.display = (question?.IsOptional ?? false) ? '' : 'none';
        if(this.RequiredIndicator !== undefined)
            this.RequiredIndicator.style.display = (question?.IsOptional ?? false) ? 'none' : '';
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

    protected MarkAsOptional() {
        if(this.MarkAsOptionalButton === undefined || this.MarkAsRequiredButton === undefined) return;
        this._IsOptional = true;
        this.MarkAsOptionalButton.style.display = 'none';
        this.MarkAsRequiredButton.style.display = '';
        NavigationPrevention.Prevent('survey-editor');
    }

    protected MarkAsRequired() {
        if(this.MarkAsOptionalButton === undefined || this.MarkAsRequiredButton === undefined) return;
        this._IsOptional = false;
        this.MarkAsOptionalButton.style.display = '';
        this.MarkAsRequiredButton.style.display = 'none';
        NavigationPrevention.Prevent('survey-editor');
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

        let range = this.AnswerWrapper.GetRange();

        if(this.Question !== undefined) {
            if(!this.IsDeleted) {
                // Zaktualizuj pytanie
                let update_awaiter = this.Question.Update(
                    this.HeadingField.value,
                    parseInt(this.QuestionTypeSelect.value),
                    range[0],
                    0,
                    range[1],
                    this.FooterField.value,
                    order,
                    this._IsOptional,
                    this.AnswerWrapper.IsNASelected(),
                    this.AnswerWrapper.IsOtherSelected()
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
                this.Question = await Question.Create(
                    this.Survey,
                    this.HeadingField.value,
                    parseInt(this.QuestionTypeSelect.value),
                    range[0],
                    0,
                    range[1],
                    this.FooterField.value,
                    order,
                    this._IsOptional,
                    this.AnswerWrapper.IsNASelected(),
                    this.AnswerWrapper.IsOtherSelected()
                );
                await this.SaveAnswers();
            } else {
                // Zniszczyć tę kartę
            }
        }
    }

    protected async SaveAnswers() {
        if(this.Question !== undefined) this.AnswerWrapper.SetQuestion(this.Question);
        return this.AnswerWrapper.Save();
    }

    public GetUserAnswers() {
        return this.AnswerWrapper.GetUserAnswers();
    }

    public ValidateFill() {
        this.ErrorNotice.textContent = '';
        let user_answers = this.GetUserAnswers();
        console.log(user_answers);
        if(this._IsOptional) {
            return true;
        } else {
            if(typeof user_answers == 'string') {
                let is_valid = user_answers != '';
                if(!is_valid) this.ErrorNotice.textContent = 'Odpowiedź na to pytanie jest obowiązkowa.';
                return is_valid;
            } else {
                let is_valid = false;
                // Wystarczy, że zaznaczono przynajmniej jedną odpowiedź
                for(let answer_id in user_answers) {
                    let user_answer = user_answers[answer_id];
                    if(user_answer === undefined) continue;
                    console.log(user_answer);
                    if(typeof user_answer == 'boolean') is_valid ||= user_answer;
                    else is_valid ||= (user_answer.length > 0);
                }
                if(!is_valid) this.ErrorNotice.textContent = 'Odpowiedź na to pytanie jest obowiązkowa.';
                return is_valid;
            }
        }
    }
}
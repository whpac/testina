import Answer from '../../entities/answer';
import Question from '../../entities/question';
import { Hash } from '../../utils/textutils';
import SurveyAnswerRow from './survey_answer_row';

export default class SurveyAnswerRowOther extends SurveyAnswerRow {
    protected UserSuppliedAnswerElement: HTMLInputElement | undefined;

    public constructor(edit_mode: boolean = false) {
        super(edit_mode);

        // Dostosuj pole wyboru
        this.CheckboxElement.type = 'checkbox';
        this.CheckboxElement.disabled = false;

        // Dostosuj treść odpowiedzi
        this.AnswerTextElement.remove();
        this.AnswerTextElement = document.createElement('label');
        this.AnswerTextElement.classList.add('text');
        this.AnswerTextElement.htmlFor = this.CheckboxElement.id;
        this.AnswerTextElement.style.fontSize = edit_mode ? '0.9em' : '1em';
        this.AnswerTextElement.style.paddingLeft = edit_mode ? '5px' : '0';
        this.AppendChild(this.AnswerTextElement);

        // Usuń przyciski
        this.ControlButtonsWrapper?.remove();
    }

    public Populate(question: Question | undefined, question_type: number, answer: Answer | undefined) {
        this.QuestionType = question_type;

        if(this.EditMode) {
            this.AnswerTextElement.textContent = ' Wyświetl opcję „Inna – jaka?”';
            this.CheckboxElement.checked = question?.HasOtherAnswer ?? false;
        } else {
            if(!(question?.HasOtherAnswer ?? false)) {
                this.Element.style.display = 'none';
                return;
            }
            this.AnswerTextElement.textContent = ' Inna – jaka? ';

            this.UserSuppliedAnswerElement = document.createElement('input');
            this.UserSuppliedAnswerElement.type = 'text';
            this.AnswerTextElement.appendChild(this.UserSuppliedAnswerElement);
            this.OnSelectionChanged();
        }

        this.CheckboxElement.name = Hash(question?.Text ?? '', question?.Id ?? 0).toString(16);
        this.CheckboxElement.type = (this.QuestionType == Question.TYPE_SINGLE_CHOICE && !this.EditMode) ? 'radio' : 'checkbox';

        let visible_for_types = [Question.TYPE_SINGLE_CHOICE, Question.TYPE_MULTI_CHOICE];
        this.Element.style.display = visible_for_types.includes(question_type) ? '' : 'none';
    }

    public SetQuestionType(question_type: number) {
        this.QuestionType = question_type;
        this.CheckboxElement.type = (this.QuestionType == Question.TYPE_SINGLE_CHOICE && !this.EditMode) ? 'radio' : 'checkbox';

        let visible_for_types = [Question.TYPE_SINGLE_CHOICE, Question.TYPE_MULTI_CHOICE];
        this.Element.style.display = visible_for_types.includes(this.QuestionType) ? '' : 'none';
    }

    public GetAnswerId() {
        return -2;
    }

    public GetValue() {
        if(this.CheckboxElement.checked) return this.UserSuppliedAnswerElement?.value.trim() ?? '';
        else return false;
    }

    public OnSelectionChanged() {
        if(this.UserSuppliedAnswerElement === undefined) return;
        this.UserSuppliedAnswerElement.disabled = !this.CheckboxElement.checked;
    }
}
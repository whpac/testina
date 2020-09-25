import Answer from '../../entities/answer';
import Question from '../../entities/question';
import { Hash } from '../../utils/textutils';
import SurveyAnswerRow from './survey_answer_row';

export default class SurveyAnswerRowNA extends SurveyAnswerRow {

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
            this.AnswerTextElement.textContent = ' Wyświetl opcję „Nie dotyczy”';
        } else {
            this.AnswerTextElement.textContent = ' Nie dotyczy';
            if(question_type == Question.TYPE_SINGLE_CHOICE) {
                this.CheckboxElement.type = 'radio';
            } else {
                this.CheckboxElement.type = 'checkbox';
            }
        }

        this.CheckboxElement.name = Hash(question?.Text ?? '', question?.Id ?? 0).toString(16);
    }

    public SetQuestionType(question_type: number) {
        this.QuestionType = question_type;
        this.CheckboxElement.type = (this.QuestionType == Question.TYPE_SINGLE_CHOICE && !this.EditMode) ? 'radio' : 'checkbox';
    }

    public GetAnswerId() {
        return -1;
    }
}
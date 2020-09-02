import Card from '../basic/card';
import Question from '../../entities/question';
import { AutoGrow } from '../../utils/elementutils';

export default class SurveyQuestionCard extends Card {
    protected Question: Question | undefined;
    protected QuestionNumberText: Text;
    protected QuestionTypeSelect: HTMLSelectElement | undefined;
    protected HeadingField: HTMLTextAreaElement | HTMLHeadingElement;
    protected FooterField: HTMLTextAreaElement | HTMLParagraphElement;

    public constructor(edit_mode: boolean = false) {
        super();

        let question_number = document.createElement('div');
        this.AppendChild(question_number);
        question_number.style.marginBottom = '3px';
        question_number.textContent = 'Pytanie ';
        question_number.appendChild(this.QuestionNumberText = document.createTextNode('0'));
        if(edit_mode) {
            question_number.appendChild(document.createTextNode(': '));
            this.QuestionTypeSelect = document.createElement('select');
            question_number.appendChild(this.QuestionTypeSelect);
            this.QuestionTypeSelect.addEventListener('change', this.ChangeQuestionType);

            let option1 = document.createElement('option');
            option1.textContent = 'Jednokrotnego wyboru';
            this.QuestionTypeSelect.appendChild(option1);
        } else {
            question_number.classList.add('secondary');
            question_number.appendChild(document.createTextNode('.'));
        }

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
        this.AppendChild(this.FooterField);
    }

    public Populate(survey: Question, question_number: number) {
        this.QuestionNumberText.textContent = question_number.toString();

        if(this.HeadingField instanceof HTMLInputElement) {
            this.HeadingField.value = survey.Text;
        } else {
            this.HeadingField.textContent = survey.Text;
        }
    }

    protected ChangeQuestionType() {
        if(this.QuestionTypeSelect === undefined) return;
    }
}
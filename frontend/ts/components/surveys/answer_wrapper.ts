import Component from '../basic/component';
import Question from '../../entities/question';
import Answer from '../../entities/answer';
import { Hash } from '../../utils/textutils';
import Icon from '../basic/icon';

export default class AnswerWrapper extends Component {
    protected ListElement: HTMLUListElement;
    protected AddAnswerButton: HTMLButtonElement | undefined;

    protected Question: Question | undefined;
    protected QuestionType: number | undefined;
    protected EditMode: boolean;
    protected Answers: Answer[] | undefined;

    public constructor(edit_mode: boolean = false) {
        super();

        this.EditMode = edit_mode;

        this.ListElement = document.createElement('ul');
        this.AppendChild(this.ListElement);
        this.ListElement.classList.add('survey-answer-wrapper');
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
        this.ListElement.textContent = '';

        for(let answer of this.Answers ?? []) {
            if(this.QuestionType == Question.TYPE_OPEN_ANSWER) break;

            let li = document.createElement('li');
            this.ListElement.appendChild(li);

            if(this.QuestionType == Question.TYPE_SINGLE_CHOICE
                || this.QuestionType == Question.TYPE_MULTI_CHOICE) {
                this.RenderClosedAnswer(li, answer);
            }
        }

        if((this.QuestionType == Question.TYPE_SINGLE_CHOICE
            || this.QuestionType == Question.TYPE_MULTI_CHOICE)
            && this.EditMode) {
            this.RenderAddAnswerButton();
        } else {
            this.RemoveAddAnswerButton();
        }

        if(this.QuestionType == Question.TYPE_OPEN_ANSWER) {
            let li = document.createElement('li');
            li.classList.add('no-hover');
            this.ListElement.appendChild(li);
            this.RenderOpenAnswer(li);
        }
    }

    protected RenderClosedAnswer(parent: HTMLElement, answer: Answer) {
        let checkbox = document.createElement('input');
        checkbox.type = this.QuestionType == Question.TYPE_SINGLE_CHOICE ? 'radio' : 'checkbox';
        checkbox.name = Hash(this.Question?.Text ?? '', this.Question?.Id ?? 0).toString(16);
        checkbox.disabled = this.EditMode;
        parent.appendChild(checkbox);

        if(this.EditMode) {
            let input = document.createElement('input');
            input.classList.add('discreet');
            input.type = 'text';
            input.placeholder = 'Podaj treść odpowiedzi';
            input.value = answer.Text;
            parent.appendChild(input);

            let btn_up = document.createElement('button');
            btn_up.classList.add('secondary', 'control-button');
            btn_up.appendChild(new Icon('arrow-up').GetElement());
            btn_up.title = 'Przenieś wyżej';
            parent.appendChild(btn_up);

            let btn_down = document.createElement('button');
            btn_down.classList.add('secondary', 'control-button');
            btn_down.appendChild(new Icon('arrow-down').GetElement());
            btn_down.title = 'Przenieś niżej';
            parent.appendChild(btn_down);

            let btn_remove = document.createElement('button');
            btn_remove.classList.add('error', 'control-button');
            btn_remove.appendChild(new Icon('trash').GetElement());
            btn_remove.title = 'Usuń odpowiedź';
            parent.appendChild(btn_remove);
        } else {
            parent.appendChild(document.createTextNode(' ' + answer.Text));
        }
    }

    protected RenderOpenAnswer(parent: HTMLElement) {
        let input = document.createElement('input');
        input.type = 'text';
        if(!this.EditMode) input.placeholder = 'Wpisz odpowiedź';
        else input.placeholder = 'Tu użytkownik wpisze odpowiedź';
        input.disabled = this.EditMode;
        parent.appendChild(input);
    }

    protected RenderAddAnswerButton() {
        if(this.AddAnswerButton !== undefined) return;

        this.AddAnswerButton = document.createElement('button');
        this.AddAnswerButton.classList.add('survey-add-answer-button');
        this.AddAnswerButton.textContent = 'Dodaj odpowiedź';
        this.AppendChild(this.AddAnswerButton);
    }

    protected RemoveAddAnswerButton() {
        if(this.AddAnswerButton === undefined) return;

        this.AddAnswerButton.remove();
        this.AddAnswerButton = undefined;
    }
}
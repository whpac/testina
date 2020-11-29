import AttemptAnswers from '../../entities/attempt_answers';
import Question from '../../entities/question';
import Card from '../basic/card';
import ScorePresenter from './score_presenter';

export default class QuestionAnswersCard extends Card {
    protected Header: HTMLHeadingElement;
    protected ContentElement: HTMLElement;

    protected Question: Question | undefined;

    public constructor() {
        super();

        this.Header = document.createElement('h2');
        this.AppendChild(this.Header);

        this.ContentElement = document.createElement('div');
        this.AppendChild(this.ContentElement);
    }

    public Populate(question: Question | undefined, answers: AttemptAnswers) {
        this.ContentElement.textContent = 'Wczytywanie...';
        this.Question = question;

        if(question === undefined) {
            this.DisplayRemovedQuestion(answers);
        } else {
            if(answers.IsOpen) this.DisplayOpenAnswerQuestion(question, answers);
            else this.DisplayClosedAnswerQuestion(question, answers);
        }
    }

    protected DisplayRemovedQuestion(answers: AttemptAnswers) {
        this.Header.textContent = 'Pytanie usunięte';
        this.ContentElement.textContent = '';

        this.ContentElement.appendChild(new ScorePresenter(answers.ScoreGot, undefined).GetElement());
    }

    protected async DisplayClosedAnswerQuestion(question: Question, answers: AttemptAnswers) {
        this.Header.textContent = question.Text;
        let question_answers = await question.GetAnswers();
        let selected_answers = [];
        let unselected_answers = [];

        for(let a of question_answers) {
            if(answers.AnswerIds.includes(a.Id)) selected_answers.push(a);
            else unselected_answers.push(a);
        }

        this.ContentElement.textContent = '';
        let grid_container = document.createElement('div');
        grid_container.style.display = 'grid';
        grid_container.style.gridTemplateColumns = '1fr 1fr';
        this.ContentElement.appendChild(grid_container);

        let selected_container = document.createElement('div');
        grid_container.appendChild(selected_container);
        selected_container.appendChild(document.createTextNode('Zaznaczone odpowiedzi:'));
        let ul1 = document.createElement('ul');
        selected_container.appendChild(ul1);
        for(let a of selected_answers) {
            let li = document.createElement('li');
            ul1.append(li);
            li.textContent = a.Text;
            if(!a.Correct) {
                li.classList.add('error');
                li.title = 'Odpowiedź nie powinna była zostać zaznaczona';
            }
        }

        let unselected_container = document.createElement('div');
        grid_container.appendChild(unselected_container);
        unselected_container.appendChild(document.createTextNode('Niezaznaczone odpowiedzi:'));
        let ul2 = document.createElement('ul');
        unselected_container.appendChild(ul2);
        for(let a of unselected_answers) {
            let li = document.createElement('li');
            ul2.append(li);
            li.textContent = a.Text;
            if(a.Correct) {
                li.classList.add('error');
                li.title = 'Odpowiedź powinna była zostać zaznaczona';
            }
        }

        this.ContentElement.appendChild(new ScorePresenter(answers.ScoreGot, question.Points).GetElement());
    }

    protected DisplayOpenAnswerQuestion(question: Question, answers: AttemptAnswers) {
        this.Header.textContent = question.Text;
        this.ContentElement.textContent = 'Wpisana odpowiedź: ' + answers.SuppliedAnswer;
        this.ContentElement.appendChild(document.createElement('br'));

        this.ContentElement.appendChild(new ScorePresenter(answers.ScoreGot, question.Points).GetElement());
    }
}
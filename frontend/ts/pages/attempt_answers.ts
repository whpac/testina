import { GoToPage } from '../1page/page_manager';
import Icon from '../components/basic/icon';
import Page from '../components/basic/page';
import Toast from '../components/basic/toast';
import QuestionAnswersCard from '../components/results/question_answers_card';
import Attempt from '../entities/attempt';
import AttemptAnswersLoader from '../entities/loaders/attemptanswersloader';
import AttemptLoader from '../entities/loaders/attemptloader';
import Question from '../entities/question';

export default class AttemptAnswers extends Page {
    protected Attempt: Attempt | undefined;
    protected UserNameText: Text;
    protected QuestionsWrapper: HTMLElement;

    public constructor() {
        super();

        let buttons_wrapper = document.createElement('div');
        buttons_wrapper.classList.add('fixed-buttons-wrapper');
        this.AppendChild(buttons_wrapper);

        let close_button = document.createElement('button');
        close_button.classList.add('button', 'header-button');
        close_button.innerHTML = '<i class="fa fa-times icon"></i><span>Zamknij</span>';
        close_button.addEventListener('click', () => GoToPage('testy/wyniki', this.Attempt?.Assignment));
        buttons_wrapper.appendChild(close_button);

        this.UserNameText = document.createTextNode('');
        let rest_of_title = document.createElement('span');
        rest_of_title.textContent = ' – udzielone odpowiedzi';
        rest_of_title.classList.add('secondary');

        let heading = document.createElement('h1');
        heading.appendChild(this.UserNameText);
        heading.appendChild(rest_of_title);
        this.AppendChild(heading);

        this.QuestionsWrapper = document.createElement('div');
        this.AppendChild(this.QuestionsWrapper);
    }

    async LoadInto(container: HTMLElement, params?: any): Promise<void> {
        try {
            this.UserNameText.textContent = 'Uczeń';
            let loading_indicator = document.createElement('div');
            loading_indicator.style.textAlign = 'center';
            loading_indicator.appendChild(new Icon('spinner', 'fa-pulse', 'fa-2x').GetElement());

            this.QuestionsWrapper.textContent = '';
            this.QuestionsWrapper.appendChild(loading_indicator);
            container.appendChild(this.Element);

            if(typeof params === 'string') params = parseInt(params);
            if(typeof params === 'number') this.Attempt = await AttemptLoader.LoadById(params);
            else this.Attempt = params as Attempt;

            this.UserNameText.textContent = this.Attempt.User.GetFullName();

            let test = this.Attempt.Assignment.Test;
            let questions_awaiter: Promise<Question[]> | Question[] = [];
            if(!test.IsDeleted) questions_awaiter = test.GetQuestions();

            let user_answers = await AttemptAnswersLoader.LoadAnswersForAttempt(this.Attempt);
            let questions = await questions_awaiter;
            let sorted_questions = [];

            for(let question of questions) {
                sorted_questions[question.Id] = question;
            }

            this.QuestionsWrapper.textContent = '';
            for(let user_answer of user_answers) {
                let answers_card = new QuestionAnswersCard();
                answers_card.Populate(sorted_questions[user_answer.QuestionId], user_answer);
                this.QuestionsWrapper.appendChild(answers_card.GetElement());
            }

            console.log();
        } catch(e) {
            let message = '.';
            if('Message' in e) message = ': ' + e.Message;

            new Toast('Nie udało się wczytać podejścia' + message).Show(0);
        }
    }

    UnloadFrom(container: HTMLElement): void {
        container.removeChild(this.Element);
    }

    GetUrlPath(): string | null {
        return 'podejścia/' + (this.Attempt?.Id ?? 0).toString();
    }

    GetTitle(): string {
        return 'Udzielone odpowiedzi';
    }

}
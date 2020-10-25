import Page from '../components/basic/page';
import Toast from '../components/basic/toast';
import QuestionAnswersCard from '../components/results/question_answers_card';
import Attempt from '../entities/attempt';
import AttemptAnswersLoader from '../entities/loaders/attemptanswersloader';
import AttemptLoader from '../entities/loaders/attemptloader';

export default class AttemptAnswers extends Page {
    protected Attempt: Attempt | undefined;
    protected UserNameText: Text;

    public constructor() {
        super();

        this.UserNameText = document.createTextNode('');

        let heading = document.createElement('h1');
        heading.appendChild(this.UserNameText);
        heading.appendChild(document.createTextNode(' – udzielone odpowiedzi'));
        this.AppendChild(heading);
    }

    async LoadInto(container: HTMLElement, params?: any): Promise<void> {
        try {
            if(typeof params === 'string') params = parseInt(params);
            if(typeof params === 'number') this.Attempt = await AttemptLoader.LoadById(params);
            else this.Attempt = params as Attempt;

            this.UserNameText.textContent = this.Attempt.User.GetFullName();

            container.appendChild(this.Element);

            let test = this.Attempt.Assignment.Test;
            let questions_awaiter = test.GetQuestions();
            let user_answers = await AttemptAnswersLoader.LoadAnswersForAttempt(this.Attempt);
            let questions = await questions_awaiter;

            for(let user_answer of user_answers) {
                let answers_card = new QuestionAnswersCard();
                answers_card.Populate(undefined, user_answer);
                this.AppendChild(answers_card);
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
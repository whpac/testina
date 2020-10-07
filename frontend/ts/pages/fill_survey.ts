import Page from '../components/basic/page';
import SurveyIntroduction from '../components/surveys/survey_introduction';
import SurveyQuestionCard from '../components/surveys/survey_question_card';
import Icon from '../components/basic/icon';
import Question from '../entities/question';
import ChromeManager from '../1page/chrome_manager';
import AssignmentLoader from '../entities/loaders/assignmentloader';
import Assignment from '../entities/assignment';
import Attempt from '../entities/attempt';
import QuestionWithUserAnswers from '../entities/question_with_user_answers';
import Toast from '../components/basic/toast';
import NavigationPrevention from '../1page/navigation_prevention';
import AuthManager from '../auth/auth_manager';
import SurveyFinalCard from '../components/surveys/survey_final_card';

export default class FillSurveyPage extends Page {
    protected Assignment: Assignment | undefined;
    protected SurveyNameHeading: Text;
    protected SurveyWrapper: HTMLElement;
    protected IntroductionCard: SurveyIntroduction;
    protected QuestionWrapper: HTMLElement;
    protected QuestionCards: SurveyQuestionCard[];
    protected SubmitButton: HTMLButtonElement;
    protected FinalCard: SurveyFinalCard;

    protected Questions: QuestionWithUserAnswers[];
    protected Attempt: Attempt | undefined;

    public constructor() {
        super();

        this.QuestionCards = [];

        let heading = document.createElement('h1');
        this.AppendChild(heading);
        let edit_text = document.createElement('span');
        heading.appendChild(edit_text);
        edit_text.classList.add('secondary');
        edit_text.textContent = 'Wypełnij: ';

        this.SurveyNameHeading = document.createTextNode('');
        heading.appendChild(this.SurveyNameHeading);

        this.SurveyWrapper = document.createElement('div');
        this.SurveyWrapper.style.display = '';
        this.AppendChild(this.SurveyWrapper);

        this.IntroductionCard = new SurveyIntroduction(false);
        this.SurveyWrapper.appendChild(this.IntroductionCard.GetElement());

        this.QuestionWrapper = document.createElement('div');
        this.SurveyWrapper.appendChild(this.QuestionWrapper);

        let sumbit_btn_wrapper = document.createElement('div');
        sumbit_btn_wrapper.classList.add('center');
        this.SurveyWrapper.appendChild(sumbit_btn_wrapper);

        this.SubmitButton = document.createElement('button');
        this.SubmitButton.appendChild(new Icon('paper-plane-o').GetElement());
        this.SubmitButton.appendChild(document.createTextNode(' Wyślij'));
        this.SubmitButton.addEventListener('click', this.Submit.bind(this));
        sumbit_btn_wrapper.appendChild(this.SubmitButton);

        this.FinalCard = new SurveyFinalCard(false);
        this.FinalCard.GetElement().style.display = 'none';
        this.AppendChild(this.FinalCard);

        this.Questions = [];
    }

    async LoadInto(container: HTMLElement, params?: any) {
        try {
            if(typeof params === 'number' || typeof params === 'string') this.Assignment = await AssignmentLoader.LoadById(params);
            else this.Assignment = params as Assignment;

            if(this.Assignment.HasDeadlineExceeded()) {
                new Toast('Termin na wypełnienie tej ankiety upłynął.').Show(0);
                return;
            }

            this.QuestionCards = [];
            this.QuestionWrapper.textContent = '';

            if(!(await AuthManager.IsAuthorized())) {
                try {
                    let key_name = 'survey_' + this.Assignment.Id;
                    let number_of_fills = localStorage.getItem(key_name);
                    if(number_of_fills === null) number_of_fills = '0';

                    if(parseInt(number_of_fills) >= this.Assignment.AttemptLimit && this.Assignment.AttemptLimit > 0) {
                        new Toast('Nie można załadować ankiety: Wypełniłeś(-aś) ją już maksymalną możliwą liczbę razy.').Show();
                        return;
                    }
                } catch(e) {

                }
            }

            this.SurveyNameHeading.textContent = this.Assignment.Test.Name;
            this.IntroductionCard.Populate(this.Assignment.Test);
            this.FinalCard.Populate(this.Assignment.Test);

            // Utwórz podejście
            this.Attempt = await Attempt.Create(this.Assignment);
            let questions = await this.Attempt.GetQuestions();

            NavigationPrevention.Prevent('filling-survey');

            questions.sort((a, b) => a.Order - b.Order);
            this.Questions = QuestionWithUserAnswers.FromArray(questions);

            for(let i = 0; i < this.Questions.length; i++) {
                await this.RenderQuestion(this.Questions[i], i + 1);
            }
            this.RefreshQuestionOrder();

            container.appendChild(this.Element);

            this.Assignment.AddEventListener('change', () => {
                this.SurveyNameHeading.textContent = this.Assignment?.Test?.Name ?? '';
                ChromeManager.SetTitle(this.GetTitle());
            });
        } catch(e) {
            let message = '.';
            if('Message' in e) message = ': ' + e.Message;

            new Toast('Nie udało się wczytać ankiety' + message).Show(0);
        }
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return 'ankiety/wypełnij/' + (this.Assignment?.Id ?? 0);
    }

    GetTitle() {
        return 'Wypełnij: ' + (this.Assignment?.Test?.Name ?? '');
    }

    async IsAccessible() {
        return true;
    }

    protected async RenderQuestion(question_with_answers: QuestionWithUserAnswers, question_number: number) {
        let question = question_with_answers.GetQuestion();

        let questions_with_provided_answers = [Question.TYPE_SINGLE_CHOICE, Question.TYPE_MULTI_CHOICE];

        if(question.Type in questions_with_provided_answers) {
            let answers = await question.GetAnswers();
            answers.sort((a, b) => a.Order - b.Order);
            question_with_answers.SetAnswers(answers);
        }

        let question_card = new SurveyQuestionCard(false);
        this.QuestionWrapper.appendChild(question_card.GetElement());
        question_card.Populate(question, question_number);
        if(this.Assignment !== undefined) question_card.SetSurvey(this.Assignment.Test);
        this.QuestionCards.push(question_card);

        if(this.QuestionCards.length >= 2) {
            let prev = this.QuestionCards[this.QuestionCards.length - 2];
            prev.NextCard = question_card;
            question_card.PreviousCard = prev;
        }
    }

    protected RefreshQuestionOrder() {
        let q_number = 1;
        for(let card of this.QuestionCards) {
            // W trybie nieedycji nie ma znaczenia, która jest ostatnia
            card.IsFirst = card.IsLast = true;
            card.SetNumber(q_number);
            q_number++;
        }
    }

    protected async Submit() {
        this.SubmitButton.disabled = true;
        let is_valid = true;

        for(let i = 0; i < this.QuestionCards.length; i++) {
            if(!this.QuestionCards[i].ValidateFill()) {
                is_valid = false;
            }

            let user_answers = this.QuestionCards[i].GetUserAnswers();
            if(typeof user_answers == 'string') {
                this.Questions[i].UserSuppliedAnswer = user_answers;
            } else {
                for(let id in user_answers) {
                    let user_answer = user_answers[id];
                    if(typeof user_answer == 'boolean') this.Questions[i].SetAnswerSelection(id, user_answer);
                    else this.Questions[i].UserSuppliedAnswer = user_answer;
                }
            }

            // W odniesieniu do ankiet oznaczenie jako ukończone nie ma znaczenia
            this.Questions[i].MarkAsDone();
        }

        if(!is_valid) {
            this.SubmitButton.disabled = false;
            new Toast('Sprawdź swoje odpowiedzi.').Show(0);
            return;
        }

        let saving_toast = new Toast('Wysyłanie odpowiedzi...');
        saving_toast.Show();

        try {
            await this.Attempt?.SaveUserAnswers(this.Questions);
            saving_toast.Hide();
            new Toast('Wysłano odpowiedzi.').Show(0);
            NavigationPrevention.Unprevent('filling-survey');

            this.SurveyWrapper.style.display = 'none';
            this.FinalCard.GetElement().style.display = '';

            if(!(await AuthManager.IsAuthorized()) && this.Assignment !== undefined) {
                try {
                    let key_name = 'survey_' + this.Assignment.Id;
                    let number_of_fills = localStorage.getItem(key_name);
                    if(number_of_fills === null) number_of_fills = '0';
                    localStorage.setItem(key_name, (parseInt(number_of_fills) + 1).toString());
                } catch(e) {

                }
            }
        } catch(e) {
            let message = '.';
            if('Message' in e) {
                message = ': ' + e.Message;
            }

            saving_toast.Hide();
            new Toast('Nie udało się wysłać odpowiedzi' + message).Show(0);
            this.SubmitButton.disabled = false;
        }
    }
}
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

export default class FillSurveyPage extends Page {
    protected Assignment: Assignment | undefined;
    protected SurveyNameHeading: Text;
    protected IntroductionCard: SurveyIntroduction;
    protected QuestionWrapper: HTMLElement;
    protected QuestionCards: SurveyQuestionCard[];
    protected SubmitButton: HTMLButtonElement;

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

        this.IntroductionCard = new SurveyIntroduction(false);
        this.AppendChild(this.IntroductionCard);

        this.QuestionWrapper = document.createElement('div');
        this.AppendChild(this.QuestionWrapper);

        let sumbit_btn_wrapper = document.createElement('div');
        sumbit_btn_wrapper.classList.add('center');
        this.AppendChild(sumbit_btn_wrapper);

        this.SubmitButton = document.createElement('button');
        this.SubmitButton.appendChild(new Icon('paper-plane-o').GetElement());
        this.SubmitButton.appendChild(document.createTextNode(' Wyślij'));
        this.SubmitButton.addEventListener('click', this.Submit.bind(this));
        sumbit_btn_wrapper.appendChild(this.SubmitButton);

        this.Questions = [];
    }

    async LoadInto(container: HTMLElement, params?: any) {
        if(typeof params === 'number') this.Assignment = await AssignmentLoader.LoadById(params);
        else this.Assignment = params as Assignment;

        this.QuestionCards = [];
        this.QuestionWrapper.textContent = '';

        this.SurveyNameHeading.textContent = this.Assignment.Test.Name;
        this.IntroductionCard.Populate(this.Assignment.Test);

        // Utwórz podejście
        let questions;
        try {
            this.Attempt = await Attempt.Create(this.Assignment);
            questions = await this.Attempt.GetQuestions();
        } catch(e) {
            throw 'Nie udało się pobrać pytań w ankiecie. Możliwe, że wypełniłeś(-aś) tę ankietę maksymalną możliwą ilość razy.';
        }

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

    protected async RenderQuestion(question_with_answers: QuestionWithUserAnswers, question_number: number) {
        let question = question_with_answers.GetQuestion();
        if(question.Type != Question.TYPE_OPEN_ANSWER) {
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
                    this.Questions[i].SetAnswerSelection(id, user_answers[id]);
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
        } catch(e) {
            saving_toast.Hide();
            new Toast('Nie udało się wysłać odpowiedzi.').Show(0);
            this.SubmitButton.disabled = false;
        }
    }
}
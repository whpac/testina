import Page from '../components/basic/page';
import Test from '../entities/test';
import SurveyLoader from '../entities/loaders/surveyloader';
import SurveyIntroduction from '../components/surveys/survey_introduction';
import SurveyQuestionCard from '../components/surveys/survey_question_card';
import Icon from '../components/basic/icon';
import Question from '../entities/question';
import ChromeManager from '../1page/chrome_manager';

export default class FillSurveyPage extends Page {
    protected Survey: Test | undefined;
    protected SurveyNameHeading: Text;
    protected IntroductionCard: SurveyIntroduction;
    protected QuestionWrapper: HTMLElement;
    protected QuestionCards: SurveyQuestionCard[];

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

        let submit_btn = document.createElement('button');
        submit_btn.appendChild(new Icon('paper-plane-o').GetElement());
        submit_btn.appendChild(document.createTextNode(' Wyślij'));
        sumbit_btn_wrapper.appendChild(submit_btn);
    }

    async LoadInto(container: HTMLElement, params?: any) {
        if(typeof params === 'number') this.Survey = await SurveyLoader.LoadById(params);
        else this.Survey = params as Test;

        this.QuestionCards = [];
        this.QuestionWrapper.textContent = '';

        this.SurveyNameHeading.textContent = this.Survey.Name;
        this.IntroductionCard.Populate(this.Survey);

        let questions = await this.Survey.GetQuestions();
        questions.sort((a, b) => a.Order - b.Order);
        for(let i = 0; i < questions.length; i++) {
            this.RenderQuestion(questions[i], i + 1);
        }
        this.RefreshQuestionOrder();

        container.appendChild(this.Element);

        this.Survey.AddEventListener('change', () => {
            this.SurveyNameHeading.textContent = this.Survey?.Name ?? '';
            ChromeManager.SetTitle(this.GetTitle());
        });
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return 'ankiety/wypełnij/' + (this.Survey?.Id ?? 0);
    }

    GetTitle() {
        return 'Wypełnij: ' + (this.Survey?.Name ?? '');
    }

    protected RenderQuestion(question: Question | undefined, question_number: number) {
        let question_card = new SurveyQuestionCard(false);
        this.QuestionWrapper.appendChild(question_card.GetElement());
        question_card.Populate(question, question_number);
        if(this.Survey !== undefined) question_card.SetSurvey(this.Survey);
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
}
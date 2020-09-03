import Page from '../components/basic/page';
import Test from '../entities/test';
import SurveyLoader from '../entities/loaders/surveyloader';
import SurveyIntroduction from '../components/surveys/survey_introduction';
import SurveyQuestionCard from '../components/surveys/survey_question_card';

export default class EditSurveyPage extends Page {
    protected Survey: Test | undefined;
    protected SurveyNameHeading: Text;
    protected IntroductionCard: SurveyIntroduction;

    public constructor() {
        super();

        let heading = document.createElement('h1');
        this.AppendChild(heading);
        let edit_text = document.createElement('span');
        heading.appendChild(edit_text);
        edit_text.classList.add('secondary');
        edit_text.textContent = 'Edytuj: ';

        this.SurveyNameHeading = document.createTextNode('');
        heading.appendChild(this.SurveyNameHeading);

        this.IntroductionCard = new SurveyIntroduction(true);
        this.AppendChild(this.IntroductionCard);
    }

    async LoadInto(container: HTMLElement, params?: any) {
        if(typeof params === 'number') this.Survey = await SurveyLoader.LoadById(params);
        else this.Survey = params as Test;

        this.SurveyNameHeading.textContent = this.Survey.Name;
        this.IntroductionCard.Populate(this.Survey);

        let questions = await this.Survey.GetQuestions();
        for(let i = 0; i < questions.length; i++) {
            let question = questions[i];
            let question_card = new SurveyQuestionCard(true);
            this.AppendChild(question_card);
            question_card.Populate(question, i + 1);
        }

        container.appendChild(this.Element);
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return 'ankiety/edytuj/' + (this.Survey?.Id ?? 0);
    }

    async GetTitle() {
        return 'Edytuj: ' + this.Survey?.Name;
    }
}
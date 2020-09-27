import Page from '../components/basic/page';
import SurveyLoader from '../entities/loaders/surveyloader';
import SurveyListCard from '../components/survey_lists/survey_list_card';
import AssignedSurveysCard from '../components/survey_lists/assigned_surveys_card';

export default class SurveysPage extends Page {
    protected AssignedSurveys: AssignedSurveysCard;
    protected SurveyListCard: SurveyListCard;

    constructor() {
        super();

        let heading = document.createElement('h1');
        heading.textContent = 'Ankiety';
        this.Element.appendChild(heading);

        this.AssignedSurveys = new AssignedSurveysCard();
        this.AppendChild(this.AssignedSurveys);

        this.SurveyListCard = new SurveyListCard();
        this.AppendChild(this.SurveyListCard);
    }

    async LoadInto(container: HTMLElement) {
        container.appendChild(this.Element);

        let surveys = await SurveyLoader.GetCreatedByCurrentUser();
        this.SurveyListCard.Populate(surveys);

        this.AssignedSurveys.Populate();
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return 'ankiety';
    }

    GetTitle() {
        return 'Ankiety';
    }
}
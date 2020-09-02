import Page from '../components/basic/page';
import SurveyLoader from '../entities/loaders/surveyloader';
import SurveyListCard from '../components/survey_lists/survey_list_card';

export default class SurveysPage extends Page {
    protected SurveyListCard: SurveyListCard;

    constructor() {
        super();

        let heading = document.createElement('h1');
        heading.textContent = 'Twoje ankiety';
        this.Element.appendChild(heading);

        this.SurveyListCard = new SurveyListCard();
        this.AppendChild(this.SurveyListCard);
    }

    async LoadInto(container: HTMLElement) {
        container.appendChild(this.Element);

        let surveys = await SurveyLoader.GetCreatedByCurrentUser();
        this.SurveyListCard.Populate(surveys);
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return 'ankiety';
    }

    async GetTitle() {
        return 'Twoje ankiety';
    }
}
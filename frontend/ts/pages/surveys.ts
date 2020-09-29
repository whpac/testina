import Page from '../components/basic/page';
import SurveyLoader from '../entities/loaders/surveyloader';
import SurveyListCard from '../components/survey_lists/survey_list_card';
import AssignedSurveysCard from '../components/survey_lists/assigned_surveys_card';
import NoSurveys from '../components/survey_lists/no_surveys';
import Toast from '../components/basic/toast';

export default class SurveysPage extends Page {
    protected AssignedSurveys: AssignedSurveysCard;
    protected SurveyListCard: SurveyListCard;
    protected NoSurveysCreated: NoSurveys;

    constructor() {
        super();

        let heading = document.createElement('h1');
        heading.textContent = 'Ankiety';
        this.Element.appendChild(heading);

        this.AssignedSurveys = new AssignedSurveysCard();
        this.AppendChild(this.AssignedSurveys);

        this.SurveyListCard = new SurveyListCard();
        this.AppendChild(this.SurveyListCard);

        this.NoSurveysCreated = new NoSurveys(true);
        this.AppendChild(this.NoSurveysCreated);
    }

    async LoadInto(container: HTMLElement) {
        container.appendChild(this.Element);

        try {
            let assigned_awaiter = this.AssignedSurveys.Populate();

            let surveys = await SurveyLoader.GetCreatedByCurrentUser();
            this.SurveyListCard.Populate(surveys);

            this.NoSurveysCreated.GetElement().style.display = surveys.length == 0 ? '' : 'none';
            this.SurveyListCard.GetElement().style.display = surveys.length == 0 ? 'none' : '';

            await assigned_awaiter;
            this.AssignedSurveys.GetElement().style.display = this.AssignedSurveys.SurveyCount > 0 ? '' : 'none';
        } catch(e) {
            let message = '.';
            if('Message' in e) message = ': ' + e.Message;

            new Toast('Nie udało się wczytać ankiet' + message).Show(0);
        }
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
import Page from '../components/basic/page';
import SurveyLoader from '../entities/loaders/surveyloader';
import SurveyListCard from '../components/survey_lists/survey_list_card';
import AssignedSurveysCard from '../components/survey_lists/assigned_surveys_card';
import NoSurveys from '../components/survey_lists/no_surveys';
import Toast from '../components/basic/toast';
import Test from '../entities/test';
import UserLoader from '../entities/loaders/userloader';
import NoSurveysAssigned from '../components/survey_lists/no_surveys_assigned';

export default class SurveysPage extends Page {
    protected AssignedSurveys: AssignedSurveysCard;
    protected SurveyListCard: SurveyListCard;
    protected NoSurveysCreated: NoSurveys;
    protected NoSurveysAssigned: NoSurveysAssigned;

    constructor() {
        super();

        let heading = document.createElement('h1');
        heading.textContent = 'Ankiety';
        this.Element.appendChild(heading);

        this.AssignedSurveys = new AssignedSurveysCard();
        this.AppendChild(this.AssignedSurveys);

        this.SurveyListCard = new SurveyListCard();
        this.SurveyListCard.AddEventListener('create-survey', this.CreateSurvey.bind(this));
        this.AppendChild(this.SurveyListCard);

        this.NoSurveysCreated = new NoSurveys(true);
        this.NoSurveysCreated.AddEventListener('create-first-survey', this.CreateSurvey.bind(this));
        this.AppendChild(this.NoSurveysCreated);

        this.NoSurveysAssigned = new NoSurveysAssigned(true);
        this.AppendChild(this.NoSurveysAssigned);
    }

    async LoadInto(container: HTMLElement) {
        container.appendChild(this.Element);

        try {
            let assigned_awaiter = this.AssignedSurveys.Populate();
            let is_survey_creator = await this.IsUserPermittedToCreateSurvey();

            if(is_survey_creator) {
                let surveys = await SurveyLoader.GetCreatedByCurrentUser();
                this.SurveyListCard.Populate(surveys);

                this.NoSurveysCreated.GetElement().style.display = surveys.length == 0 ? '' : 'none';
                this.SurveyListCard.GetElement().style.display = surveys.length == 0 ? 'none' : '';
                this.NoSurveysAssigned.GetElement().style.display = 'none';
            } else {
                this.SurveyListCard.GetElement().style.display = 'none';
                this.NoSurveysCreated.GetElement().style.display = 'none';
            }

            await assigned_awaiter;
            this.AssignedSurveys.GetElement().style.display = this.AssignedSurveys.SurveyCount > 0 ? '' : 'none';
            if(this.AssignedSurveys.SurveyCount <= 0) {
                this.NoSurveysAssigned.GetElement().style.display = is_survey_creator ? 'none' : '';
            }
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

    protected async CreateSurvey() {
        if(!(await this.IsUserPermittedToCreateSurvey())) {
            alert('Nie masz uprawnień do tworzenia ankiet.');
            return;
        }

        let creating_toast = new Toast('Tworzenie ankiety...');
        creating_toast.Show();

        try {
            let survey = await Test.Create('[Bez nazwy]', 1, 0, Test.TYPE_SURVEY, SurveyLoader.LoadById);
            this.SurveyListCard.AppendSurvey(survey);

            this.SurveyListCard.GetElement().style.display = '';
            this.NoSurveysCreated.GetElement().style.display = 'none';
        } catch(e) {
            let message = '.';
            if('Message' in e) message = ': ' + e.Message;

            new Toast('Nie udało się utworzyć ankiety' + message).Show(0);
        } finally {
            creating_toast.Hide();
        }
    }

    protected async IsUserPermittedToCreateSurvey(): Promise<boolean> {
        let current_user = await UserLoader.GetCurrent();
        return (current_user?.IsTestCreator === true);
    }
}
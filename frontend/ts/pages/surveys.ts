import Page from '../components/basic/page';
import SurveyLoader from '../entities/loaders/surveyloader';

export default class SurveysPage extends Page {

    constructor() {
        super();

        let heading = document.createElement('h1');
        heading.textContent = 'Twoje ankiety';
        this.Element.appendChild(heading);
    }

    async LoadInto(container: HTMLElement) {
        container.appendChild(this.Element);

        let surveys = await SurveyLoader.GetAllMadeByCurrentUser();
        console.log(surveys);
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
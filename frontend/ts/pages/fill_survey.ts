import Page from '../components/basic/page';

export default class FillSurveyPage extends Page {

    public constructor() {
        super();

        let heading = document.createElement('h1');
        this.AppendChild(heading);
        heading.textContent = 'Wypełnij ankietę';
    }

    async LoadInto(container: HTMLElement, params?: any) {
        container.appendChild(this.Element);
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return 'ankiety/wypełnij';
    }

    async GetTitle() {
        return 'Wypełnij ankietę';
    }

}
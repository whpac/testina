import Page from '../components/basic/page';
import Card from '../components/basic/card';
import TestinaCard from '../components/about/testina_card';

export default class AboutPage extends Page {

    constructor() {
        super();

        let header = document.createElement('h1');
        header.textContent = 'Informacje';
        this.AppendChild(header);

        this.AppendChild(new TestinaCard());
    }

    async LoadInto(container: HTMLElement, params?: any) {
        container.appendChild(this.Element);
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return 'informacje';
    }

    async GetTitle() {
        return 'Informacje';
    }

}
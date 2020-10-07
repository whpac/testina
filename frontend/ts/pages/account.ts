import Page from '../components/basic/page';

export default class AccountPage extends Page {

    public constructor() {
        super();

        let heading = document.createElement('h1');
        heading.textContent = 'Twoje konto';
        this.AppendChild(heading);
    }

    async LoadInto(container: HTMLElement, params?: any) {
        container.appendChild(this.Element);
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return 'konto';
    }

    GetTitle() {
        return 'Twoje konto';
    }
}
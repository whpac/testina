import Page from '../components/basic/page';
import LoginCard from '../components/login/login_card';

export default class LoginPage extends Page {

    constructor() {
        super();

        let header = document.createElement('h1');
        header.textContent = 'Logowanie do Testiny';
        this.AppendChild(header);

        let card = new LoginCard();
        this.AppendChild(card);
    }

    async LoadInto(container: HTMLElement) {
        container.appendChild(this.Element);
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return 'zaloguj';
    }

    async GetTitle() {
        return 'Logowanie';
    }

}
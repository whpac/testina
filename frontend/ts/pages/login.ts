import Page from '../components/basic/page';
import LoginCard from '../components/login/login_card';
import AuthManager from '../auth/auth_manager';

export default class LoginPage extends Page {

    constructor() {
        super();

        let header = document.createElement('h1');
        header.textContent = 'Logowanie do Testiny';
        this.AppendChild(header);

        let card = new LoginCard();
        this.AppendChild(card);
    }

    public async IsAccessible() {
        return !(await AuthManager.IsAuthorized());
    }

    async LoadInto(container: HTMLElement) {
        container.appendChild(this.Element);
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return null;
    }

    async GetTitle() {
        return 'Logowanie';
    }

}
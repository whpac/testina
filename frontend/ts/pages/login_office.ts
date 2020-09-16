import Page from '../components/basic/page';
import AuthManager from '../auth/auth_manager';
import LoginWithOfficeCard from '../components/login/login_with_office_card';

export default class LoginWithOfficePage extends Page {

    constructor() {
        super();

        let card = new LoginWithOfficeCard();
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

    GetTitle() {
        return 'Logowanie';
    }

}
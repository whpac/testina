import AccountCard from '../components/account/account_card';
import SiteSettingsCard from '../components/account/site_settings_card';
import Page from '../components/basic/page';

export default class AccountPage extends Page {
    protected AccountCard: AccountCard;

    public constructor() {
        super();

        let heading = document.createElement('h1');
        heading.textContent = 'Twoje konto';
        this.AppendChild(heading);

        this.AccountCard = new AccountCard();
        this.AppendChild(this.AccountCard);

        let settings_card = new SiteSettingsCard();
        this.AppendChild(settings_card);
    }

    async LoadInto(container: HTMLElement, params?: any) {
        this.AccountCard.Populate();

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
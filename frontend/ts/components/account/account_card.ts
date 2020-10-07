import UserLoader from '../../entities/loaders/userloader';
import Card from '../basic/card';

export default class AccountCard extends Card {
    protected Heading: HTMLHeadingElement;
    protected Subtitle: HTMLElement;
    protected GroupsText: Text;
    protected GroupsList: HTMLElement;

    public constructor() {
        super();

        this.Heading = document.createElement('h2');
        this.Heading.textContent = 'Wczytywanie...';
        this.AppendChild(this.Heading);

        this.Subtitle = document.createElement('span');
        this.Subtitle.classList.add('subtitle');
        this.AppendChild(this.Subtitle);

        this.GroupsText = document.createTextNode('Wczytywanie Twoich grup...');
        this.AppendChild(this.GroupsText);

        this.GroupsList = document.createElement('ul');
        this.AppendChild(this.GroupsList);
    }

    public async Populate() {
        this.Heading.textContent = 'Wczytywanie...';
        this.Subtitle.textContent = '';
        this.GroupsText.textContent = 'Wczytywanie Twoich grup...';

        let current_user = await UserLoader.GetCurrent();
        if(current_user === undefined) throw new Error('Nie udało się pobrać informacji o Twoim koncie.');

        this.Heading.textContent = current_user.GetFullName();
        this.Subtitle.textContent = 'Konto połączone z Office 365';
        this.GroupsText.textContent = 'Grupy, do których należysz:';
    }
}
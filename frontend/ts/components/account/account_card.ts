import GroupLoader from '../../entities/loaders/grouploader';
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

        let processed_data_notice = document.createElement('p');
        processed_data_notice.classList.add('small', 'secondary');
        processed_data_notice.textContent = `
        Testina przetwarza następujące dane o Tobie: Twoje imię i nazwisko, rodzaj gramatyczny
        imienia (w celu dopasowania form komunikatów), unikatowy identyfikator, powiązany z Twoim
        kontem Office, oraz grupy, do których należysz. Te dane są pobierane bezpośrednio z serwera
        usługi Microsoft Graph (punktu dostępowego do danych z Office 365). Testina przechowuje je
        potem przez okres przynajmniej 12 godzin, aby zmniejszyć ruch sieciowy do usługi zewnętrznej
        oraz po to, by zmniejszyć czas oczekiwania na załadowanie się poszczególnych podstron. Aplikacja
        nie ma dostępu do Twojego loginu ani hasła, ani pozostałych danych przechowywanych w usłudze
        Office, innych niż wcześniej wymienione.`;
        this.AppendChild(processed_data_notice);
    }

    public async Populate() {
        this.Heading.textContent = 'Wczytywanie...';
        this.Subtitle.textContent = '';
        this.GroupsText.textContent = 'Wczytywanie Twoich grup...';
        this.GroupsList.textContent = '';

        let groups_awaiter = GroupLoader.GetGroupsWithCurrentUser();
        let current_user = await UserLoader.GetCurrent();

        if(current_user === undefined) throw new Error('Nie udało się pobrać informacji o Twoim koncie.');

        this.Heading.textContent = current_user.GetFullName();
        this.Subtitle.textContent = 'Konto połączone z Office 365';

        let groups = await groups_awaiter;
        if(groups.length > 0) {
            this.GroupsText.textContent = 'Grupy, do których należysz:';
            this.GroupsList.style.display = '';
        } else {
            this.GroupsText.textContent = 'Nie należysz do żadnej grupy.';
            this.GroupsList.style.display = 'none';
        }

        for(let group of groups) {
            let li = document.createElement('li');
            li.textContent = group.Name;
            this.GroupsList.appendChild(li);
        }
    }
}
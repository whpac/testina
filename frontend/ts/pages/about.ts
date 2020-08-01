import Page from '../components/basic/page';
import Card from '../components/basic/card';

export default class AboutPage extends Page {

    constructor(){
        super();

        let header = document.createElement('h1');
        header.textContent = 'Informacje';
        this.AppendChild(header);

        let card = new Card('auto-width');
        card.GetContentElement().innerHTML = 
                '<h2 class="center">Testina</h2>' +
                '<p class="secondary center">Copyright &copy; 2020, Marcin Szwarc</p>' +
                '<div class="center small">' +
                    'Regulamin &bull; Pomoc' +
                '</div>';
        this.AppendChild(card.GetElement());
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
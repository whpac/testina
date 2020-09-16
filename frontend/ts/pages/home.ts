import Page from '../components/basic/page';

export default class HomePage extends Page {

    constructor() {
        super();

        this.Element.innerHTML = '<h1>Strona główna</h1>' +
            '<div class="card">' +
            '<h2>Witaj!</h2>' +
            'Witaj na stronie!' +
            '</div>';
    }

    async LoadInto(container: HTMLElement) {
        container.appendChild(this.Element);
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return '';
    }

    GetTitle() {
        return '';
    }
}
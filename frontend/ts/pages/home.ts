import Page from '../components/basic/page';

export default class HomePage extends Page {
    PageElem: HTMLElement;

    constructor(){
        super();

        let pg = document.createElement('div');
        pg.innerHTML = '<h1>Strona główna</h1>' +
                        '<div class="card">' +
                            '<h2>Witaj!</h2>' +
                            'Witaj na stronie!' +
                        '</div>';
        this.PageElem = pg;
    }

    async LoadInto(container: HTMLElement){
        //let response = await XHR.Request('greeting.json', 'GET');
        //let json = JSON.parse(response.ResponseText);
        //this.GreetingElem.innerText = 'Hi, Lorem!';
        container.appendChild(this.PageElem);
    }

    UnloadFrom(container: HTMLElement){
        container.removeChild(this.PageElem);
    }

    GetUrlPath(){
        return '';
    }

    async GetTitle(){
        return '';
    }
}
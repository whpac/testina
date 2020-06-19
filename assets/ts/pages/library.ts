import Page from '../1page/page';
import TestsTable from '../components/tests_table';
import Card from '../components/card';

export default class LibraryPage extends Page {
    PageElem: HTMLElement;
    TestsListTable: TestsTable;

    constructor(){
        super();

        this.PageElem = document.createElement('div');
        this.PageElem.innerHTML = '<h1>Biblioteka testów</h1>';

        let card = new Card('semi-wide');
        card.GetContentElement().innerHTML =
                '<a class="button header-button" href="testy/utwórz"><i class="fa fa-plus icon"></i><span>Utwórz nowy</span></a>' +
                '<h2>Moje testy</h2>' +
                '<p class="secondary">Tutaj wyświetlane są wszystkie stworzone przez Ciebie testy.</p>';
        this.PageElem.appendChild(card.GetElement());

        this.TestsListTable = new TestsTable();
        card.AppendChild(this.TestsListTable.GetElement());
    }

    async LoadInto(container: HTMLElement){
        /* await */ this.TestsListTable.LoadTests();

        container.appendChild(this.PageElem);
    }

    UnloadFrom(container: HTMLElement){
        container.removeChild(this.PageElem);
    }

    GetUrlPath(){
        return 'testy/biblioteka';
    }

    async GetTitle(){
        return 'Biblioteka testów';
    }
}
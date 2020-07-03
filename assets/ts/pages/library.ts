import Page from '../components/general/page';
import TestsTable from '../components/tests_table';
import Card from '../components/general/card';

export default class LibraryPage extends Page {
    PageElem: HTMLElement;
    TestsListTable: TestsTable;

    constructor(){
        super();

        this.PageElem = document.createElement('div');
        this.PageElem.innerHTML = '<h1>Biblioteka testów</h1>';

        let card = new Card('semi-wide');

        let create_button = document.createElement('button');
        create_button.classList.add('button', 'header-button');
        create_button.innerHTML = '<i class="fa fa-plus icon"></i><span>Utwórz nowy</span>';
        create_button.addEventListener('click', this.CreateTest.bind(this));
        card.AppendChild(create_button);

        let header = document.createElement('h2');
        header.textContent = 'Moje testy';
        card.AppendChild(header);

        let description = document.createElement('p');
        description.classList.add('secondary');
        description.textContent = 'Tutaj wyświetlane są wszystkie stworzone przez Ciebie testy.';
        card.AppendChild(description);

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

    CreateTest(){
        this.TestsListTable.CreateTest();
    }

    GetUrlPath(){
        return 'testy/biblioteka';
    }

    async GetTitle(){
        return 'Biblioteka testów';
    }
}
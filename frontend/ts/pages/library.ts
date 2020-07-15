import Page from '../components/basic/page';
import TestsTable from '../components/tests_lists/tests_table';
import Card from '../components/basic/card';

export default class LibraryPage extends Page {
    TestsListTable: TestsTable;

    constructor(){
        super();

        this.Element.innerHTML = '<h1>Biblioteka testów</h1>';

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

        this.Element.appendChild(card.GetElement());

        this.TestsListTable = new TestsTable();
        card.AppendChild(this.TestsListTable.GetElement());
    }

    async LoadInto(container: HTMLElement){
        /* await */ this.TestsListTable.LoadTests();

        container.appendChild(this.Element);
    }

    UnloadFrom(container: HTMLElement){
        container.removeChild(this.Element);
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
import Page from '../components/basic/page';
import TestsTable from '../components/tests_lists/tests_table';
import Card from '../components/basic/card';
import EmptyLibrary from '../components/tests_lists/empty_states/empty_library';

export default class LibraryPage extends Page {
    TestsListTable: TestsTable;
    LibraryCard: Card;
    EmptyLibrary: EmptyLibrary;

    constructor() {
        super();

        this.Element.innerHTML = '<h1>Biblioteka testów</h1>';

        this.LibraryCard = new Card('semi-wide');

        let create_button = document.createElement('button');
        create_button.classList.add('button', 'header-button');
        create_button.innerHTML = '<i class="fa fa-plus icon"></i><span>Utwórz nowy</span>';
        create_button.addEventListener('click', this.CreateTest.bind(this));
        this.LibraryCard.AppendChild(create_button);

        let header = document.createElement('h2');
        header.textContent = 'Moje testy';
        this.LibraryCard.AppendChild(header);

        let description = document.createElement('p');
        description.classList.add('secondary');
        description.textContent = 'Tutaj wyświetlane są wszystkie stworzone przez Ciebie testy.';
        this.LibraryCard.AppendChild(description);

        this.Element.appendChild(this.LibraryCard.GetElement());

        this.TestsListTable = new TestsTable();
        this.LibraryCard.AppendChild(this.TestsListTable.GetElement());

        this.EmptyLibrary = new EmptyLibrary(true);
        this.AppendChild(this.EmptyLibrary);
        this.EmptyLibrary.AddEventListener('create-first-test', this.CreateTest.bind(this));
    }

    async LoadInto(container: HTMLElement) {
        container.appendChild(this.Element);

        await this.TestsListTable.LoadTests();
        if(this.TestsListTable.GetRowCount() == 0) {
            this.LibraryCard.GetElement().style.display = 'none';
            this.EmptyLibrary.GetElement().style.display = '';
        }
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    CreateTest() {
        this.EmptyLibrary.GetElement().style.display = 'none';
        this.LibraryCard.GetElement().style.display = '';
        this.TestsListTable.CreateTest();
    }

    GetUrlPath() {
        return 'testy/biblioteka';
    }

    GetTitle() {
        return 'Biblioteka testów';
    }
}
import Page from '../1page/page';
import Card from '../components/card';
import QuestionsTable from '../components/questions_table';
import TestSettings from '../components/test_settings';
import Test from '../entities/test';

export default class EditTestPage extends Page {
    PageElem: HTMLElement;
    QuestionsTable: QuestionsTable;
    TestNameHeading: Text
    TestSettingsCard: TestSettings;
    Test: Test | undefined;

    constructor(){
        super();

        this.PageElem = document.createElement('div');
        
        let page_heading = document.createElement('h1');
        page_heading.innerHTML = '<span class="secondary">Edycja: </span>';
        page_heading.appendChild(this.TestNameHeading = document.createTextNode(''));
        this.PageElem.appendChild(page_heading);

        let question_list_card = new Card();
        question_list_card.GetContentElement().innerHTML = '<h2>Pytania</h2>';

        this.QuestionsTable = new QuestionsTable();
        question_list_card.AppendChild(this.QuestionsTable.GetElement());

        let center_div = document.createElement('div');
        center_div.classList.add('center');
        center_div.innerHTML = '<button id="add-question-button">Dodaj pytanie</button>';
        question_list_card.AppendChild(center_div);

        this.PageElem.appendChild(question_list_card.GetElement());

        this.TestSettingsCard = new TestSettings();
        this.PageElem.appendChild(this.TestSettingsCard.GetElement());
    }

    async LoadInto(container: HTMLElement, params?: any){
        this.Test = params.test;
        if(this.Test === undefined) throw '';

        this.QuestionsTable.LoadQuestions(this.Test);
        this.TestSettingsCard.Populate(this.Test);
        container.appendChild(this.PageElem);
        
        this.TestNameHeading.textContent = await this.Test.GetName();
    }

    UnloadFrom(container: HTMLElement){
        container.removeChild(this.PageElem);
    }

    GetUrlPath(){
        return 'testy/edytuj/' + (this.Test?.GetId() ?? 0);
    }

    async GetTitle(){
        return 'Edycja: ' + (await this.Test?.GetName());
    }
}
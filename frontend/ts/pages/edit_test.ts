import Page from '../components/basic/page';
import Card from '../components/basic/card';
import QuestionsTable from '../components/test_editing/questions_table';
import TestSettings from '../components/test_editing/test_settings';
import Test from '../entities/test';
import PageParams from '../1page/pageparams';

import * as PageManager from '../1page/pagemanager';
import TestLoader from '../entities/loaders/testloader';

export default class EditTestPage extends Page {
    QuestionsTable: QuestionsTable;
    TestNameHeading: Text
    TestSettingsCard: TestSettings;
    Test: Test | undefined;

    constructor(){
        super();

        let page_heading = document.createElement('h1');
        page_heading.innerHTML = '<span class="secondary">Edycja: </span>';
        page_heading.appendChild(this.TestNameHeading = document.createTextNode(''));
        this.Element.appendChild(page_heading);

        let question_list_card = new Card();
        question_list_card.GetContentElement().innerHTML = '<h2>Pytania</h2>';

        this.QuestionsTable = new QuestionsTable();
        question_list_card.AppendChild(this.QuestionsTable.GetElement());

        this.Element.appendChild(question_list_card.GetElement());

        this.TestSettingsCard = new TestSettings();
        this.Element.appendChild(this.TestSettingsCard.GetElement());
    }

    async LoadInto(container: HTMLElement, params?: PageParams){
        if(typeof params === 'number') this.Test = await TestLoader.LoadById(params);
        else this.Test = params as Test;

        this.QuestionsTable.LoadQuestions(this.Test);
        this.TestSettingsCard.Populate(this.Test);
        container.appendChild(this.Element);
        
        this.TestNameHeading.textContent = this.Test.Name;
        this.Test.AddEventListener('change', (async () => {
            let new_name = this.Test?.Name ?? '';
            this.TestNameHeading.textContent = new_name;
            PageManager.SetTitle('Edycja: ' + new_name);
        }).bind(this));
    }

    UnloadFrom(container: HTMLElement){
        container.removeChild(this.Element);
    }

    GetUrlPath(){
        return 'testy/edytuj/' + (this.Test?.Id ?? 0);
    }

    async GetTitle(){
        return 'Edycja: ' + this.Test?.Name;
    }
}
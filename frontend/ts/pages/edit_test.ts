import Page from '../components/basic/page';
import Card from '../components/basic/card';
import QuestionsTable from '../components/test_editing/questions_table';
import TestSettings from '../components/test_editing/test_settings';
import Test from '../entities/test';
import PageParams from '../1page/pageparams';

import * as PageManager from '../1page/pagemanager';

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
        if(typeof params === 'number') this.Test = new Test(params);
        else this.Test = params as Test;

        this.QuestionsTable.LoadQuestions(this.Test);
        this.TestSettingsCard.Populate(this.Test);
        container.appendChild(this.Element);
        
        this.TestNameHeading.textContent = await this.Test.GetName();
        this.Test.AddEventListener('change', (async () => {
            let new_name = (await this.Test?.GetName()) ?? '';
            this.TestNameHeading.textContent = new_name;
            PageManager.SetTitle('Edycja: ' + new_name);
        }).bind(this));
    }

    UnloadFrom(container: HTMLElement){
        container.removeChild(this.Element);
    }

    GetUrlPath(){
        return 'testy/edytuj/' + (this.Test?.GetId() ?? 0);
    }

    async GetTitle(){
        return 'Edycja: ' + (await this.Test?.GetName());
    }
}
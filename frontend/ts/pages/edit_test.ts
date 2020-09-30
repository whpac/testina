import Page from '../components/basic/page';
import Card from '../components/basic/card';
import QuestionsTable from '../components/test_editing/questions_table';
import TestSettings from '../components/test_editing/test_settings';
import Test from '../entities/test';
import PageParams from '../1page/page_params';

import * as PageManager from '../1page/page_manager';
import TestLoader from '../entities/loaders/testloader';
import ChromeManager from '../1page/chrome_manager';
import Icon from '../components/basic/icon';
import Toast from '../components/basic/toast';

export default class EditTestPage extends Page {
    QuestionsTable: QuestionsTable;
    TestNameHeading: Text;
    TestSettingsCard: TestSettings;
    Test: Test | undefined;

    constructor() {
        super();

        let btn_wrapper = document.createElement('div');
        btn_wrapper.classList.add('fixed-buttons-wrapper');
        this.AppendChild(btn_wrapper);

        let close_btn = document.createElement('button');
        close_btn.classList.add('header-button');
        close_btn.appendChild(new Icon('times').GetElement());
        close_btn.appendChild(document.createTextNode('Zamknij'));
        close_btn.addEventListener('click', (e) => PageManager.GoToPage('testy/biblioteka'));
        btn_wrapper.appendChild(close_btn);

        let page_heading = document.createElement('h1');
        page_heading.innerHTML = '<span class="secondary">Edycja: </span>';
        page_heading.appendChild(this.TestNameHeading = document.createTextNode(''));
        this.Element.appendChild(page_heading);

        let question_list_card = new Card();
        let card_heading = document.createElement('h2');
        card_heading.textContent = 'Pytania';
        question_list_card.AppendChild(card_heading);

        this.QuestionsTable = new QuestionsTable();
        question_list_card.AppendChild(this.QuestionsTable.GetElement());

        this.Element.appendChild(question_list_card.GetElement());

        this.TestSettingsCard = new TestSettings();
        this.Element.appendChild(this.TestSettingsCard.GetElement());
    }

    async LoadInto(container: HTMLElement, params?: PageParams) {
        try {
            if(typeof params === 'string') this.Test = await TestLoader.LoadById(parseInt(params));
            else this.Test = params as Test;

            this.QuestionsTable.LoadQuestions(this.Test);
            this.TestSettingsCard.Populate(this.Test);
            container.appendChild(this.Element);

            this.TestNameHeading.textContent = this.Test.Name;
            this.Test.AddEventListener('change', (async () => {
                let new_name = this.Test?.Name ?? '';
                this.TestNameHeading.textContent = new_name;
                ChromeManager.SetTitle('Edycja: ' + new_name);
            }).bind(this));
        } catch(e) {
            let message = '.';
            if('Message' in e) message = ': ' + e.Message;

            new Toast('Nie udało się wczytać testu' + message).Show(0);
        }
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return 'testy/edytuj/' + (this.Test?.Id ?? 0);
    }

    GetTitle() {
        return 'Edycja: ' + this.Test?.Name;
    }
}
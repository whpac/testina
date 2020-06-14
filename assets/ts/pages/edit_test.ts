import Page from '../1page/page';
import Card from '../components/card';
import QuestionsTable from '../components/questions_table';

export default class EditTestPage extends Page {
    PageElem: HTMLElement;
    QuestionsTable: QuestionsTable;
    Test;

    constructor(){
        super();

        this.PageElem = document.createElement('div');
        this.PageElem.innerHTML = '<h1><span class="secondary">Edycja:</span> <span id="heading-test-title">ABC</span></h1>';

        let question_list_card = new Card();
        question_list_card.GetElement().innerHTML = '<h2>Pytania</h2>';

        this.QuestionsTable = new QuestionsTable();
        question_list_card.AppendChild(this.QuestionsTable.GetElement());

        let center_div = document.createElement('div');
        center_div.classList.add('center');
        center_div.innerHTML = '<button id="add-question-button">Dodaj pytanie</button>';
        question_list_card.AppendChild(center_div);

        this.PageElem.appendChild(question_list_card.GetElement());

        let test_settings_card = new Card();
        this.PageElem.appendChild(test_settings_card.GetElement());
        test_settings_card.GetElement().innerHTML =
            '<h2>Ustawienia testu</h2>' +
            '<div class="grid-form">' +
                '<label for="question-name-input">Nazwa:</label>' +
                '<input id="question-name-input" type="text" class="narrow event-made-changes-to-settings" />' +
                '<label for="question-multiplier">Mnożnik pytań:</label>' +
                '<span>' +
                    '<input id="question-multiplier" class="event-made-changes-to-settings" type="number" step="any" min="0" />' +
                    '<a class="get-help todo fa fa-question-circle" href="pomoc" title="Pomoc" target="_blank"></a>' +
                '</span>' +
                '<p class="description secondary">' +
                    'Ta wartość oznacza, ile razy każde pytanie zostanie wyświetlone użytkownikowi. ' +
                    'Szczegółowy opis znajduje się w <a href="pomoc" class="todo" target="_blank">artykule pomocy</a>.' +
                '</p>' +
                '<div class="fieldset">' +
                    'Limit czasu na podejście <a class="get-help todo fa fa-question-circle" href="pomoc" title="Pomoc" target="_blank"></a><br />' +
                    '<input type="radio" name="time-limit" id="with-time-limit" class="event-update-test-time-limit" />' +
                    '<input type="number" id="set-time-limit" min="1" class="event-made-changes-to-settings" />' +
                    '<label for="set-time-limit">minut</label><br />' +
                    '<input type="radio" name="time-limit" id="no-time-limit" class="event-update-test-time-limit" />' +
                    '<label for="no-time-limit">Brak limitu</label>' +
                '</div>' +
            '</div>' +
            '<div class="card-buttons">' +
                '<button id="save-test-settings-button">Zapisz</button>' +
                '<button class="error" id="remove-test-button">Usuń test</button>' +
            '</div>';
    }

    async LoadInto(container: HTMLElement, params?: any){
        //let response = await XHR.Request('greeting.json', 'GET');
        //let json = JSON.parse(response.ResponseText);
        //this.GreetingElem.innerText = 'Hi, Lorem!';
        this.Test = params.test;
        this.QuestionsTable.LoadQuestions(this.Test)
        container.appendChild(this.PageElem);
    }

    UnloadFrom(container: HTMLElement){
        container.removeChild(this.PageElem);
    }

    GetUrlPath(){
        return 'testy/edytuj/' + (this.Test?.id ?? 0);
    }

    GetTitle(){
        return 'Edycja: ABC';
    }
}
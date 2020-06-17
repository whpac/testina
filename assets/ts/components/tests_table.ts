import * as XHR from '../xhr';
import Component from './component';
import Test from '../entities/test';
import TestSummaryDialog from './test_summary_dialog';
import { HandleLinkClick } from '../script';

interface TestDescriptor {
    id: number,
    name: string,
    author: {},
    creation_date: string,
    time_limit: number,
    question_multiplier: number,
    questions: {}
}

interface TestsListResponse {
    [test_id: number]: TestDescriptor,
}

export default class TestsTable extends Component {
    protected IsLoaded: boolean;
    protected TestRowsContainer: HTMLTableSectionElement;
    protected SummaryDialog: TestSummaryDialog;

    constructor(){
        super();
        this.IsLoaded = false;

        this.Element = document.createElement('table');
        this.Element.classList.add('table', 'full-width');
        this.Element.innerHTML = 
            '<colgroup>' +
                '<col />' +
                '<col />' +
                '<col />' +
                '<col class="shrink" />' +
                '<col class="shrink" />' +
                '<col class="shrink" />' +
            '</colgroup>' +
            '<tr>' +
                '<th>Nazwa testu</th>' +
                '<th class="center wide-screen-only">Ilość pytań</th>' +
                '<th class="center wide-screen-only">Data utworzenia</th>' +
                '<th class="wide-screen-only"></th>' +
                '<th class="wide-screen-only"></th>' +
                '<th class="narrow-screen-only"></th>' +
            '</tr>';
        
        this.TestRowsContainer = document.createElement('tbody');
        this.TestRowsContainer.innerHTML = '<tr><td>Loading...</td></tr>';
        this.Element.appendChild(this.TestRowsContainer);

        this.SummaryDialog = new TestSummaryDialog();
    }

    async LoadTests(){
        if(this.IsLoaded) return;

        //let response = await XHR.Request('_dev?target=tests&depth=3', 'GET');
        //let json: TestsListResponse = JSON.parse(response.ResponseText);
        let json: Test[] = await Test.GetAll();

        this.TestRowsContainer.innerText = '';
        json.forEach(async (test) => {
            //let test = json[parseInt(test_id)];
            let tr = document.createElement('tr');
            let html = '';
            html += '<td>' + (await test.GetName()).toString() + '</td>';
            html += '<td class="center wide-screen-only">' + (await test.GetQuestionCount()).toString() + ' (×' + (await test.GetQuestionMultiplier()).toString() + ')</td>';
            html += '<td class="center wide-screen-only">' + (await test.GetCreationDate()).toLocaleString(undefined, {year: 'numeric', month: '2-digit', day: 'numeric', hour: '2-digit', minute: '2-digit'}) + '</td>';
            html += '<td class="wide-screen-only"><button class="compact todo">Przypisz</button></td>';
            //html += '<td class="wide-screen-only"><a class="button compact" href="testy/edytuj/' + test.id + '">Edytuj</a></td>';

            let td_edit = document.createElement('td');
            td_edit.classList.add('wide-screen-only');

            let a_edit = document.createElement('a');
            a_edit.classList.add('button', 'compact');
            a_edit.innerText = 'Edytuj';
            a_edit.href = 'testy/edytuj/' + test.GetId();
            a_edit.addEventListener('click', (e) => HandleLinkClick(e, 'testy/edytuj', {test: test}));
            td_edit.appendChild(a_edit);

            let td_details = document.createElement('td');
            td_details.classList.add('narrow-screen-only');
            
            let btn_details = document.createElement('button');
            btn_details.innerHTML = '<i class="fa fa-ellipsis-h"></i>';
            btn_details.addEventListener('click', () => {
                this.SummaryDialog.Prepare(test);
                this.SummaryDialog.Show();
            });
            td_details.appendChild(btn_details);

            tr.innerHTML = html;
            tr.appendChild(td_edit);
            tr.appendChild(td_details);
            this.TestRowsContainer.appendChild(tr);
        });
        this.IsLoaded = true;
    }
}
import * as DateUtils from '../dateutils';
import Component from './component';
import Test from '../entities/test';
import TestSummaryDialog from './test_summary_dialog';
import { HandleLinkClick } from '../script';

export default class TestsTable extends Component {
    protected IsLoaded: boolean;
    protected TestRowsContainer: HTMLTableSectionElement;
    protected SummaryDialog: TestSummaryDialog;

    /**
     * Prepare the table to be displayed
     */
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
                '<th class="center wide-screen-only">Utworzono</th>' +
                '<th class="wide-screen-only"></th>' +
                '<th class="wide-screen-only"></th>' +
                '<th class="narrow-screen-only"></th>' +
            '</tr>';
        
        this.TestRowsContainer = document.createElement('tbody');
        this.TestRowsContainer.innerHTML = 
            '<tr>' +
                '<td>Ładowanie...</td>' +
                '<td class="wide-screen-only"></td>' +
                '<td class="wide-screen-only"></td>' +
                '<td class="wide-screen-only"></td>' +
                '<td class="wide-screen-only"></td>' +
                '<td class="narrow-screen-only"></td>' +
            '</tr>';
        this.Element.appendChild(this.TestRowsContainer);

        this.SummaryDialog = new TestSummaryDialog();
    }

    async LoadTests(){
        if(this.IsLoaded) return;

        let json: Test[] = await Test.GetAll();

        this.TestRowsContainer.innerText = '';
        json.forEach(async (test) => {
            let tr = this.TestRowsContainer.insertRow(0);

            let td_name = tr.insertCell(-1);
            td_name.textContent = (await test.GetName()).toString();

            let td_qcount = tr.insertCell(-1);
            td_qcount.classList.add('center', 'wide-screen-only');
            td_qcount.textContent =
                (await test.GetQuestionCount()).toString() + 
                ' (×' + (await test.GetQuestionMultiplier()).toString() + ')';

            let td_date = tr.insertCell(-1);
            td_date.classList.add('center', 'wide-screen-only');
            td_date.textContent = DateUtils.ToMediumFormat(await test.GetCreationDate());

            let td_assign = tr.insertCell(-1);
            td_assign.classList.add('wide-screen-only');
            let btn_assign = document.createElement('button');
            btn_assign.classList.add('compact', 'todo');
            btn_assign.textContent = 'Przypisz';
            td_assign.appendChild(btn_assign);

            let td_edit = tr.insertCell(-1);
            td_edit.classList.add('wide-screen-only');

            let link_edit = document.createElement('a');
            link_edit.classList.add('button', 'compact');
            link_edit.innerText = 'Edytuj';
            link_edit.href = 'testy/edytuj/' + test.GetId();
            link_edit.addEventListener('click', (e) => HandleLinkClick(e, 'testy/edytuj', {test: test}));
            td_edit.appendChild(link_edit);

            let td_details = tr.insertCell(-1);
            td_details.classList.add('narrow-screen-only');
            
            let btn_details = document.createElement('button');
            btn_details.innerHTML = '<i class="fa fa-ellipsis-h"></i>';
            btn_details.addEventListener('click', () => {
                this.SummaryDialog.Prepare(test);
                this.SummaryDialog.Show();
            });
            td_details.appendChild(btn_details);
        });
        this.IsLoaded = true;
    }
}
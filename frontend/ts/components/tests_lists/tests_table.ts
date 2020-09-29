import * as DateUtils from '../../utils/dateutils';
import Component from '../basic/component';
import Test from '../../entities/test';
import TestSummaryDialog from './test_summary_dialog';
import { HandleLinkClick } from '../../1page/page_manager';
import Toast from '../basic/toast';
import AssignTestDialog from './assigning/assign_test_dialog';
import TestLoader from '../../entities/loaders/testloader';

export default class TestsTable extends Component {
    protected TestRowsContainer: HTMLTableSectionElement;
    protected SummaryDialog: TestSummaryDialog;
    protected AssignDialog: AssignTestDialog;
    protected RowCount: number = 0;

    /**
     * Prepare the table to be displayed
     */
    constructor() {
        super();

        this.Element = document.createElement('table');
        this.Element.classList.add('table', 'full-width');
        this.Element.innerHTML =
            '<colgroup>' +
            '<col />' +
            '<col class="wide-screen-only" />' +
            '<col class="wide-screen-only" />' +
            '<col class="shrink xlarge-screen-only" />' +
            '<col class="shrink wide-screen-only" />' +
            '<col class="shrink" />' +
            '</colgroup>' +
            '<tr>' +
            '<th>Nazwa testu</th>' +
            '<th class="center wide-screen-only">Ilość pytań</th>' +
            '<th class="center wide-screen-only">Utworzono</th>' +
            '<th class="xlarge-screen-only"></th>' +
            '<th class="wide-screen-only"></th>' +
            '<th></th>' +
            '</tr>';

        this.TestRowsContainer = document.createElement('tbody');
        this.ClearContent();
        this.Element.appendChild(this.TestRowsContainer);

        this.SummaryDialog = new TestSummaryDialog();
        this.AssignDialog = new AssignTestDialog();
    }

    ClearContent(message?: string) {
        message = message ?? 'Ładowanie...';
        this.TestRowsContainer.innerHTML =
            '<tr>' +
            '<td>' + message + '</td>' +
            '<td class="wide-screen-only"></td>' +
            '<td class="wide-screen-only"></td>' +
            '<td class="xlarge-screen-only"></td>' +
            '<td class="wide-screen-only"></td>' +
            '<td></td>' +
            '</tr>';
    }

    async LoadTests() {
        let tests: Test[] = [];
        try {
            tests = await TestLoader.GetCreatedByCurrentUser();
            this.TestRowsContainer.innerText = '';
            this.RowCount = 0;
        } catch(e) {
            let message = '.';
            if('Message' in e) {
                message = ': ' + e.Message;
            }
            this.ClearContent('Nie udało się załadować listy testów' + message);
        }

        tests.forEach(this.AppendRow.bind(this));
    }

    async AppendRow(test: Test) {
        let tr = this.TestRowsContainer.insertRow(0);
        this.RowCount++;

        test.AddEventListener('remove', () => tr.remove());

        let td_name = tr.insertCell(-1);
        td_name.textContent = test.Name.toString();

        let td_qcount = tr.insertCell(-1);
        td_qcount.classList.add('center', 'wide-screen-only');
        td_qcount.textContent =
            (test.QuestionCount ?? 0).toString() +
            ' (×' + test.QuestionMultiplier.toString() + ')';

        let td_date = tr.insertCell(-1);
        td_date.classList.add('center', 'wide-screen-only');
        td_date.textContent = DateUtils.ToMediumFormat(test.CreationDate);

        let td_assign = tr.insertCell(-1);
        td_assign.classList.add('xlarge-screen-only');
        let btn_assign = document.createElement('button');
        btn_assign.classList.add('compact');
        btn_assign.textContent = 'Przypisz';
        btn_assign.addEventListener('click', () => {
            this.AssignDialog.Populate(test);
            this.AssignDialog.Show();
        });
        td_assign.appendChild(btn_assign);

        let td_edit = tr.insertCell(-1);
        td_edit.classList.add('wide-screen-only');

        let link_edit = document.createElement('a');
        link_edit.classList.add('button', 'compact');
        link_edit.innerText = 'Edytuj';
        link_edit.href = 'testy/edytuj/' + test.Id;
        link_edit.addEventListener('click', (e) => HandleLinkClick(e, 'testy/edytuj', test));
        td_edit.appendChild(link_edit);

        let td_details = tr.insertCell(-1);

        let btn_details = document.createElement('button');
        btn_details.classList.add('compact-on-wide-screen');
        btn_details.innerHTML = '<i class="fa fa-ellipsis-h"></i>';
        btn_details.addEventListener('click', () => {
            this.SummaryDialog.Prepare(test);
            this.SummaryDialog.Show();
        });
        td_details.appendChild(btn_details);

        test.AddEventListener('change', async () => {
            td_name.textContent = test.Name.toString();
            td_qcount.textContent =
                (test.QuestionCount ?? 0).toString() +
                ' (×' + test.QuestionMultiplier.toString() + ')';
        });
    }

    public GetRowCount() {
        return this.RowCount;
    }

    async CreateTest() {
        try {
            let test = await Test.Create('[Bez nazwy]', 1, 0);
            this.AppendRow(test);
        } catch(e) {
            let message = '.';
            if('Message' in e) {
                message = ': ' + e.Message;
            }
            new Toast('Nie udało się utworzyć nowego testu' + message).Show(0);
        }
    }
}
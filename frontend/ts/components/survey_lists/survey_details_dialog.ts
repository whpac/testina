import { GoToPage } from '../../1page/page_manager';
import Assignment from '../../entities/assignment';
import Test from '../../entities/test';
import { ToMediumFormat } from '../../utils/dateutils';
import Dialog from '../basic/dialog';
import AssignTestDialog from '../tests_lists/assigning/assign_test_dialog';

export default class SurveyDetailsDialog extends Dialog {
    protected SurveyCreationDateElement: HTMLTableDataCellElement;
    protected SurveyFillsCountElement: HTMLTableDataCellElement;
    protected ShareStatusElement: HTMLElement;
    protected LinkPresenterElement: HTMLInputElement;
    protected ShareLink: HTMLAnchorElement;

    protected Survey: Test | undefined;
    protected Assignments: Assignment[] | undefined;

    public constructor() {
        super();

        let content_table = document.createElement('table');
        content_table.classList.add('table', 'full-width', 'center');

        let row: HTMLTableRowElement[] = [];
        row[0] = content_table.insertRow(-1);
        row[0].appendChild(document.createElement('th'));
        row[0].appendChild(document.createElement('th'));

        row[1] = content_table.insertRow(-1);
        row[1].insertCell(-1).textContent = 'Utworzono:';
        this.SurveyCreationDateElement = row[1].insertCell(-1);

        row[2] = content_table.insertRow(-1);
        row[2].insertCell(-1).textContent = 'Wypełnień:';
        this.SurveyFillsCountElement = row[2].insertCell(-1);

        row[3] = content_table.insertRow(-1);
        let share_cell = row[3].insertCell(-1);
        share_cell.colSpan = 2;

        let share_heading = document.createElement('span');
        share_heading.classList.add('inline-header');
        share_heading.textContent = 'Udostępnianie';
        share_cell.appendChild(share_heading);

        let share_element = document.createElement('div');
        share_cell.appendChild(share_element);

        this.ShareStatusElement = document.createElement('p');
        share_element.appendChild(this.ShareStatusElement);
        this.ShareStatusElement.classList.add('small-margin', 'secondary');
        this.ShareStatusElement.textContent = 'Ankieta nie jest nikomu udostępniona';

        this.LinkPresenterElement = document.createElement('input');
        share_element.appendChild(this.LinkPresenterElement);
        this.LinkPresenterElement.classList.add('link-presenter-input');
        this.LinkPresenterElement.readOnly = true;
        this.LinkPresenterElement.type = 'text';
        this.LinkPresenterElement.value = 'http://localhost/p';
        this.LinkPresenterElement.style.display = 'none';

        this.ShareLink = document.createElement('a');
        share_element.appendChild(this.ShareLink);
        this.ShareLink.href = 'javascript:void(0)';
        this.ShareLink.textContent = 'Zarządzaj...';
        this.ShareLink.addEventListener('click', this.DisplayAssignDialog.bind(this));

        this.AddContent(content_table);

        let close_btn = document.createElement('button');
        close_btn.textContent = 'Zamknij';
        close_btn.addEventListener('click', this.Hide.bind(this));
        this.AddButton(close_btn);

        let btn_edit = document.createElement('button');
        this.AddButton(btn_edit);
        btn_edit.classList.add('secondary');
        btn_edit.textContent = 'Edytuj';
        btn_edit.addEventListener('click', (() => GoToPage('ankiety/edytuj', this.Survey)).bind(this));

        let btn_results = document.createElement('button');
        this.AddButton(btn_results);
        btn_results.classList.add('secondary');
        btn_results.textContent = 'Wyniki';
    }

    public async Populate(survey: Test) {
        this.Survey = survey;
        this.SetHeader(survey.Name);

        this.SurveyCreationDateElement.textContent = ToMediumFormat(survey.CreationDate, true);

        this.Assignments = await this.Survey.GetAssignments();

        if(this.Assignments.length > 0) {
            this.ShareStatusElement.textContent = 'Ankieta została udostępniona (komu?)';
        } else {
            this.ShareStatusElement.textContent = 'Ankieta nie jest nikomu udostępniona';
            this.ShareLink.textContent = 'Udostępnij...';
        }
    }

    protected async DisplayAssignDialog() {
        if(this.Survey === undefined || this.Assignments === undefined) return;

        let assign_dialog = new AssignTestDialog();
        if(this.Assignments.length == 0) {
            assign_dialog.Populate(this.Survey);
        } else {
            let assignment = this.Assignments[0];
            assign_dialog.Populate(this.Survey, await assignment.GetTargets(), assignment);
        }
        assign_dialog.Show();
    }
}
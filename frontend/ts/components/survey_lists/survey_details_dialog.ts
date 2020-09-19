import { GoToPage } from '../../1page/page_manager';
import Assignment from '../../entities/assignment';
import Test from '../../entities/test';
import { ToMediumFormat } from '../../utils/dateutils';
import Dialog from '../basic/dialog';
import AssignTestDialog from '../tests_lists/assigning/assign_test_dialog';

export default class SurveyDetailsDialog extends Dialog {
    protected SurveyCreationDateElement: HTMLTableDataCellElement;
    protected SurveyFillsCountElement: HTMLTableDataCellElement;
    protected SeeShareesElement: HTMLTableDataCellElement;

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
        row[3].style.display = 'none';
        this.SeeShareesElement = row[3].insertCell(-1);
        this.SeeShareesElement.colSpan = 2;

        row[4] = content_table.insertRow(-1);
        let share_cell = row[4].insertCell(-1);
        share_cell.colSpan = 2;

        let share_heading = document.createElement('span');
        share_heading.classList.add('inline-header');
        share_heading.textContent = 'Udostępnij';
        share_cell.appendChild(share_heading);

        let share_element = document.createElement('div');
        share_element.style.textAlign = 'left';
        share_cell.appendChild(share_element);

        let share_to_users_wrapper = document.createElement('div');
        share_element.appendChild(share_to_users_wrapper);

        let share_to_users_checkbox = document.createElement('input');
        share_to_users_checkbox.type = 'checkbox';

        let share_to_users_label = document.createElement('label');
        share_to_users_wrapper.appendChild(share_to_users_label);
        share_to_users_label.appendChild(share_to_users_checkbox);
        share_to_users_label.classList.add('secondary', 'with-checkbox');
        share_to_users_label.appendChild(document.createTextNode(' Udostępnij wybranym osobom'));

        let share_by_link_wrapper = document.createElement('div');
        share_element.appendChild(share_by_link_wrapper);

        let share_by_link_checkbox = document.createElement('input');
        share_by_link_checkbox.type = 'checkbox';

        let share_by_link_label = document.createElement('label');
        share_by_link_wrapper.appendChild(share_by_link_label);
        share_by_link_label.appendChild(share_by_link_checkbox);
        share_by_link_label.classList.add('secondary', 'with-checkbox');
        share_by_link_label.appendChild(document.createTextNode(' Udostępnij wszystkim, którzy dostaną link'));

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
        this.SeeShareesElement.textContent = '';

        this.Assignments = await this.Survey.GetAssignments();

        if(this.Assignments.length > 0) {
            let see_sharees = document.createElement('a');
            see_sharees.textContent = 'Ankieta została udostępniona';
            see_sharees.href = 'javascript:void(0)';
            see_sharees.addEventListener('click', this.DisplayAssignDialog.bind(this));
            this.SeeShareesElement.appendChild(see_sharees);
            this.SeeShareesElement.classList.remove('secondary');
        } else {
            this.SeeShareesElement.appendChild(document.createTextNode('Ankieta jeszcze nie została udostępniona. '));

            let share = document.createElement('a');
            share.textContent = 'Udostępnij';
            share.href = 'javascript:void(0)';
            share.addEventListener('click', this.DisplayAssignDialog.bind(this));
            this.SeeShareesElement.appendChild(share);
            this.SeeShareesElement.classList.add('secondary');
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
        this.Hide();
        assign_dialog.Show();
    }
}
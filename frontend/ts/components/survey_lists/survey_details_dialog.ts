import { GoToPage } from '../../1page/page_manager';
import Assignment, { AssignmentTargets } from '../../entities/assignment';
import Test from '../../entities/test';
import { ToMediumFormat } from '../../utils/dateutils';
import { n } from '../../utils/textutils';
import Dialog from '../basic/dialog';
import AssignTestDialog from '../tests_lists/assigning/assign_test_dialog';

export default class SurveyDetailsDialog extends Dialog {
    protected SurveyCreationDateElement: HTMLTableDataCellElement;
    protected SurveyFillsCountElement: HTMLTableDataCellElement;
    protected ShareStatusElement: HTMLElement;
    protected LinkPresenterElement: HTMLInputElement;
    protected ShareLink: HTMLAnchorElement;
    protected readonly LinkBeginning: string = 'http://localhost/p/ankiety/wypełnij/';

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
        this.ShareStatusElement.classList.add('small-margin', 'secondary', 'center');
        this.ShareStatusElement.textContent = 'Wczytywanie danych...';

        this.LinkPresenterElement = document.createElement('input');
        share_element.appendChild(this.LinkPresenterElement);
        this.LinkPresenterElement.classList.add('link-presenter-input');
        this.LinkPresenterElement.readOnly = true;
        this.LinkPresenterElement.type = 'text';
        this.LinkPresenterElement.value = 'Wczytywanie linku...';
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
        btn_edit.addEventListener('click', (() => {
            this.Hide();
            GoToPage('ankiety/edytuj', this.Survey);
        }).bind(this));

        let btn_results = document.createElement('button');
        this.AddButton(btn_results);
        btn_results.classList.add('secondary');
        btn_results.textContent = 'Wyniki';
        btn_results.addEventListener('click', (() => {
            this.Hide();
            // GoToPage(..., this.Survey);
        }).bind(this));
    }

    public async Populate(survey: Test) {
        this.Survey = survey;
        this.SetHeader(survey.Name);

        this.SurveyCreationDateElement.textContent = ToMediumFormat(survey.CreationDate, true);

        this.Assignments = await this.Survey.GetAssignments();

        if(this.Assignments.length > 0) {
            this.ShareStatusElement.textContent = 'Ankieta została udostępniona';
            let assignment_targets = await this.Assignments[0].GetTargets();
            this.ShareStatusElement.textContent = 'Ankieta została udostępniona ' + this.MakeTargetsText(assignment_targets);
            if(assignment_targets.LinkIds.length > 0) {
                this.LinkPresenterElement.style.display = '';
                this.LinkPresenterElement.value = this.LinkBeginning + assignment_targets.LinkIds[0];
            } else {
                this.LinkPresenterElement.style.display = 'none';
                this.LinkPresenterElement.nodeValue = 'Wczytywanie linku...';
            }
        } else {
            this.ShareStatusElement.textContent = 'Ankieta nie jest nikomu udostępniona';
            this.ShareLink.textContent = 'Udostępnij...';
            this.LinkPresenterElement.style.display = 'none';
            this.LinkPresenterElement.value = 'Wczytywanie linku...';
        }
    }

    protected MakeTargetsText(targets: AssignmentTargets) {
        let groups_count = targets.Groups.length;
        let users_count = targets.Users.length;
        let links_count = targets.LinkIds.length;

        if(users_count == 1 && groups_count == 0) {
            return targets.Users[0].GetFullName();
        }
        if(users_count == 0 && groups_count == 1) {
            return targets.Groups[0].Name;
        }

        let targets_parts = [];
        if(groups_count > 0) {
            targets_parts.push(groups_count.toString() + '\xa0grup' + n(groups_count, 'ie', 'om'));
        }
        if(users_count > 0) {
            targets_parts.push(users_count.toString() + '\xa0osob' + n(users_count, 'ie', 'om'));
        }
        if(links_count > 0) {
            targets_parts.push('tym,\xa0którzy dostali\xa0link');
        }

        if(targets_parts.length == 0) return 'nikomu';

        let targets_text = '';
        for(let i = 0; i < targets_parts.length; i++) {
            targets_text += targets_parts[i];
            switch(targets_parts.length - i) {
                case 1:
                    break;
                case 2:
                    targets_text += ' i\xa0';
                    break;
                default:
                    targets_text += ', ';
                    break;
            }
        }

        return targets_text;
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
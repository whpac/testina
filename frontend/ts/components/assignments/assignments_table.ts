import Component from '../basic/component';
import Assignment, { AssignmentTargets } from '../../entities/assignment';
import * as DateUtils from '../../utils/dateutils';
import { n } from '../../utils/textutils';
import { HandleLinkClick } from '../../1page/page_manager';
import Icon from '../basic/icon';
import AssignTestDialog from '../tests_lists/assigning/assign_test_dialog';

export default class AssignmentsTable extends Component {
    protected Element: HTMLTableElement;
    protected TableBody: HTMLTableSectionElement;
    protected AssignTestDialog: AssignTestDialog;

    constructor() {
        super();

        this.Element = document.createElement('table');
        this.Element.classList.add('table', 'full-width');

        let colgroup = document.createElement('colgroup');
        let col_shrink = document.createElement('col');
        col_shrink.classList.add('shrink');
        let col_wide = document.createElement('col');
        col_wide.classList.add('wide-screen-only');

        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(col_wide.cloneNode(false));
        colgroup.appendChild(col_shrink.cloneNode(false));
        colgroup.appendChild(col_shrink.cloneNode(false));
        this.Element.appendChild(colgroup);

        this.TableBody = this.Element.createTBody();
        let tr_loading = this.TableBody.insertRow(-1);
        let td_loading = tr_loading.insertCell(-1);
        td_loading.colSpan = 5;
        td_loading.classList.add('secondary');
        td_loading.textContent = 'Ładowanie...';

        let thead_row = this.Element.createTHead().insertRow(-1);
        let ths: HTMLTableHeaderCellElement[] = [];

        for(let i = 0; i < 5; i++) {
            ths[i] = document.createElement('th');
            thead_row.appendChild(ths[i]);
        }
        ths[0].textContent = 'Przypisano';
        ths[1].textContent = 'Termin';
        ths[2].textContent = 'Komu';

        ths[2].classList.add('wide-screen-only');

        this.AssignTestDialog = new AssignTestDialog();
    }

    public async Populate(assignments: Assignment[]) {
        this.TableBody.textContent = '';
        for(let assignment of assignments) {
            let tr = this.TableBody.insertRow(0);
            let cells: HTMLTableDataCellElement[] = [];
            for(let i = 0; i < 5; i++) {
                cells[i] = tr.insertCell(-1);
                cells[i].classList.add('center');
            }

            cells[0].textContent = DateUtils.ToDayHourFormat(assignment.AssignmentDate);
            cells[1].textContent = DateUtils.ToDayHourFormat(assignment.Deadline);

            let edit_btn = document.createElement('button');
            edit_btn.classList.add('compact');
            edit_btn.appendChild(new Icon('pencil', 'narrow-screen-only').GetElement());
            cells[3].appendChild(edit_btn);

            let edit_btn_text = document.createElement('span');
            edit_btn_text.textContent = 'Edytuj';
            edit_btn_text.classList.add('wide-screen-only');
            edit_btn.appendChild(edit_btn_text);

            let results_btn = document.createElement('a');
            results_btn.classList.add('button', 'compact');
            results_btn.textContent = 'Wyniki';
            results_btn.href = 'testy/wyniki/' + assignment.Id;
            results_btn.addEventListener('click', (e) => HandleLinkClick(e, 'testy/wyniki', assignment));
            cells[4].appendChild(results_btn);

            if(!assignment.HasDeadlineExceeded()) {
                cells[1].classList.add('success');
                cells[1].title = 'Termin jeszcze nie upłynął';
            } else {
                cells[1].title = 'Termin upłynął';
            }

            let targets = await assignment.GetTargets();
            cells[2].textContent = this.MakeTargetsText(targets);
            cells[2].classList.add('wide-screen-only');

            edit_btn.addEventListener('click', async () => {
                this.AssignTestDialog.Populate(assignment.Test, await assignment.GetTargets(), assignment);
                this.AssignTestDialog.Show();
            });

            assignment.AddEventListener('change', async () => {
                cells[1].textContent = DateUtils.ToDayHourFormat(assignment.Deadline);
                if(!assignment.HasDeadlineExceeded()) {
                    cells[1].classList.add('success');
                    cells[1].title = 'Termin jeszcze nie upłynął';
                } else {
                    cells[1].title = 'Termin upłynął';
                }

                let targets = await assignment.GetTargets();
                cells[2].textContent = this.MakeTargetsText(targets);
            });
        }
    }

    protected MakeTargetsText(targets: AssignmentTargets) {
        let groups_count = targets.Groups.length;
        let users_count = targets.Users.length;

        if(users_count == 1 && groups_count == 0) {
            return targets.Users[0].GetFullName();
        }
        if(users_count == 0 && groups_count == 1) {
            return targets.Groups[0].Name;
        }

        let targets_text = '';
        if(groups_count > 0) {
            targets_text += ' ' + groups_count.toString() + ' grup' + n(groups_count, 'ie', 'om');
        }
        if(groups_count > 0 && users_count > 0) targets_text += ' i';
        if(users_count > 0) {
            targets_text += ' ' + users_count.toString() + ' osob' + n(users_count, 'ie', 'om');
        }
        return targets_text != '' ? targets_text.substr(1) : 'nikomu';
    }
}
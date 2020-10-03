import Component from '../basic/component';
import Test from '../../entities/test';
import { ToMediumFormat } from '../../utils/dateutils';
import { HandleLinkClick } from '../../1page/page_manager';
import Icon from '../basic/icon';
import SurveyDetailsDialog from './survey_details_dialog';

export default class SurveyTable extends Component {
    protected Element: HTMLTableElement;
    protected TBody: HTMLTableSectionElement;

    public constructor() {
        super();

        this.Element = document.createElement('table');
        this.Element.classList.add('table', 'full-width');

        let colgroup = document.createElement('colgroup');
        this.Element.appendChild(colgroup);
        let col_shrink = document.createElement('col');
        col_shrink.classList.add('shrink');
        let col_xwide = document.createElement('col');
        col_xwide.classList.add('xlarge-screen-only');
        let col_wide = document.createElement('col');
        col_wide.classList.add('wide-screen-only', 'shrink');

        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(col_xwide.cloneNode(false));
        colgroup.appendChild(col_wide.cloneNode(false));
        colgroup.appendChild(col_wide.cloneNode(false));
        colgroup.appendChild(col_shrink.cloneNode(false));

        let heading_row = this.Element.createTHead().insertRow();
        let ths: HTMLTableHeaderCellElement[] = [];
        for(let i = 0; i < 6; i++) {
            ths[i] = document.createElement('th');
            heading_row.appendChild(ths[i]);
        }

        ths[0].textContent = 'Nazwa';
        ths[1].textContent = 'Wypełnień';
        ths[2].textContent = 'Data utworzenia';

        ths[2].classList.add('xlarge-screen-only');
        ths[3].classList.add('wide-screen-only');
        ths[4].classList.add('wide-screen-only');

        this.TBody = this.Element.createTBody();
    }

    public Populate(surveys: Test[]) {
        this.TBody.textContent = '';

        // Posortuj ankiety od najnowszych
        surveys.sort((a, b) => b.CreationDate.valueOf() - a.CreationDate.valueOf());

        for(let survey of surveys) {
            let tr = this.TBody.insertRow();

            let td_name = tr.insertCell(-1);
            td_name.textContent = survey.Name;

            let td_fills = tr.insertCell(-1);
            td_fills.classList.add('center');
            td_fills.appendChild(new Icon('spinner', 'fa-pulse').GetElement());
            // Policz ilość wypełnień, asynchronicznie, aby nie blokować ładowania
            (async () => {
                let assignments = await survey.GetAssignments();
                if(assignments.length > 0) {
                    td_fills.textContent = (await assignments[0].CountAllAttempts()).toString();
                } else {
                    td_fills.textContent = '0';
                }
            })();

            let td_created = tr.insertCell(-1);
            td_created.classList.add('center', 'xlarge-screen-only');
            td_created.textContent = ToMediumFormat(survey.CreationDate, true);

            let td_results = tr.insertCell(-1);
            td_results.classList.add('wide-screen-only');
            let btn_results = document.createElement('a');
            td_results.appendChild(btn_results);
            btn_results.classList.add('button', 'compact', 'todo');
            btn_results.textContent = 'Wyniki';
            btn_results.href = 'ankiety/wyniki/' + survey.Id;
            btn_results.addEventListener('click', (e) => HandleLinkClick(e, 'ankiety/wyniki', survey));

            let td_edit = tr.insertCell(-1);
            td_edit.classList.add('wide-screen-only');
            let btn_edit = document.createElement('a');
            td_edit.appendChild(btn_edit);
            btn_edit.classList.add('button', 'compact');
            btn_edit.textContent = 'Edytuj';
            btn_edit.href = 'ankiety/edytuj/' + survey.Id.toString();
            btn_edit.addEventListener('click', (e) => HandleLinkClick(e, 'ankiety/edytuj', survey));

            let td_more = tr.insertCell(-1);
            let btn_more = document.createElement('button');
            td_more.appendChild(btn_more);
            btn_more.classList.add('compact');
            btn_more.appendChild(new Icon('ellipsis-h').GetElement());
            btn_more.addEventListener('click', (() => this.DisplaySurveyDetailsDialog(survey)).bind(this));
        }
    }

    protected DisplaySurveyDetailsDialog(survey: Test) {
        let dialog = new SurveyDetailsDialog();
        dialog.Populate(survey);
        dialog.Show();
    }
}
import Component from '../basic/component';
import Test from '../../entities/test';
import { ToMediumFormat } from '../../utils/dateutils';
import { HandleLinkClick } from '../../1page/page_manager';
import Icon from '../basic/icon';
import SurveyDetailsDialog from './survey_details_dialog';
import Assignment from '../../entities/assignment';

export default class AssignedSurveysTable extends Component {
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

        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(col_xwide.cloneNode(false));
        colgroup.appendChild(col_shrink.cloneNode(false));

        let heading_row = this.Element.createTHead().insertRow();
        let ths: HTMLTableHeaderCellElement[] = [];
        for(let i = 0; i < 4; i++) {
            ths[i] = document.createElement('th');
            heading_row.appendChild(ths[i]);
        }

        ths[0].textContent = 'Nazwa';
        ths[1].textContent = 'Autor';
        ths[2].textContent = 'Data udostępnienia';

        ths[2].classList.add('xlarge-screen-only');

        this.TBody = this.Element.createTBody();
    }

    public Populate(assignments: Assignment[]) {
        this.TBody.textContent = '';

        // Posortuj ankiety od najnowszych
        assignments.sort((a, b) => b.AssignmentDate.valueOf() - a.AssignmentDate.valueOf());

        for(let assignment of assignments) {
            let survey = assignment.Test;
            let tr = this.TBody.insertRow();

            let td_name = tr.insertCell(-1);
            td_name.textContent = survey.Name;

            let td_author = tr.insertCell(-1);
            td_author.classList.add('center');

            let author_full_name = document.createElement('span');
            td_author.appendChild(author_full_name);
            author_full_name.classList.add('wide-screen-only');
            author_full_name.textContent = survey.Author.GetFullName();

            let author_initial = document.createElement('span');
            td_author.appendChild(author_initial);
            author_initial.classList.add('narrow-screen-only');
            author_initial.textContent = survey.Author.GetInitial();

            let td_assigned = tr.insertCell(-1);
            td_assigned.classList.add('center', 'xlarge-screen-only');
            td_assigned.textContent = ToMediumFormat(assignment.AssignmentDate, true);

            let td_fill = tr.insertCell(-1);
            let btn_fill = document.createElement('button');
            td_fill.appendChild(btn_fill);
            btn_fill.classList.add('compact', 'todo');
            btn_fill.appendChild(new Icon('pencil-square-o', 'narrow-screen-only').GetElement());

            let fill_caption = document.createElement('span');
            btn_fill.appendChild(fill_caption);
            fill_caption.classList.add('wide-screen-only');
            fill_caption.textContent = 'Wypełnij';
        }
    }

    protected DisplaySurveyDetailsDialog(survey: Test) {
        let dialog = new SurveyDetailsDialog();
        dialog.Populate(survey);
        dialog.Show();
    }
}
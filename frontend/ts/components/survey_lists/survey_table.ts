import Component from '../basic/component';
import Test from '../../entities/test';
import { ToMediumFormat } from '../../utils/dateutils';
import { HandleLinkClick } from '../../1page/page_manager';

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

        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(col_shrink.cloneNode(false));
        colgroup.appendChild(col_shrink.cloneNode(false));

        let heading_row = this.Element.createTHead().insertRow();
        let ths: HTMLTableHeaderCellElement[] = [];
        for(let i = 0; i < 5; i++) {
            ths[i] = document.createElement('th');
            heading_row.appendChild(ths[i]);
        }

        ths[0].textContent = 'Nazwa';
        ths[1].textContent = 'Wypełnień';
        ths[2].textContent = 'Data utworzenia';

        this.TBody = this.Element.createTBody();
    }

    public Populate(surveys: Test[]) {
        this.TBody.textContent = '';

        for(let survey of surveys) {
            let tr = this.TBody.insertRow();

            let td_name = tr.insertCell(-1);
            td_name.textContent = survey.Name;

            let td_fills = tr.insertCell(-1);
            td_fills.classList.add('center', 'todo');
            td_fills.textContent = '??';

            let td_created = tr.insertCell(-1);
            td_created.classList.add('center');
            td_created.textContent = ToMediumFormat(survey.CreationDate, true);

            let td_results = tr.insertCell(-1);
            let btn_results = document.createElement('button');
            td_results.appendChild(btn_results);
            btn_results.classList.add('compact', 'todo');
            btn_results.textContent = 'Wyniki';

            let td_edit = tr.insertCell(-1);
            let btn_edit = document.createElement('a');
            td_edit.appendChild(btn_edit);
            btn_edit.classList.add('button', 'compact', 'todo');
            btn_edit.textContent = 'Edytuj';
            btn_edit.href = 'ankiety/edytuj/' + survey.Id.toString();
            btn_edit.addEventListener('click', (e) => HandleLinkClick(e, 'ankiety/edytuj', survey));
        }
    }
}
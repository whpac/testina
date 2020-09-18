import { GoToPage } from '../../1page/page_manager';
import Test from '../../entities/test';
import { ToMediumFormat } from '../../utils/dateutils';
import Dialog from '../basic/dialog';

export default class SurveyDetailsDialog extends Dialog {
    protected SurveyCreationDateElement: HTMLTableDataCellElement;
    protected SurveyFillsCountElement: HTMLTableDataCellElement;

    protected Survey: Test | undefined;

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
        row[3].insertCell(-1).textContent = 'Udostępniono:';

        let see_sharees = document.createElement('a');
        see_sharees.textContent = 'Wyświetl, komu';
        see_sharees.href = '#';
        row[3].insertCell(-1).appendChild(see_sharees);

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

    public Populate(survey: Test) {
        this.SetHeader(survey.Name);

        this.SurveyCreationDateElement.textContent = ToMediumFormat(survey.CreationDate, true);
    }
}
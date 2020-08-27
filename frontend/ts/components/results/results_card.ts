import Card from '../basic/card';
import Assignment from '../../entities/assignment';
import ResultsTable from './results_table';
import { n } from '../../utils/textutils';
import { GoToPage } from '../../1page/page_manager';

export default class ResultsCard extends Card {
    protected AttemptLimitText: Text;
    protected ResultsTable: ResultsTable;
    protected Assignment: Assignment | undefined;

    constructor() {
        super('semi-wide');

        let close_button = document.createElement('button');
        close_button.classList.add('button', 'header-button');
        close_button.innerHTML = '<i class="fa fa-times icon"></i><span>Zamknij</span>';
        close_button.addEventListener('click', () => GoToPage('testy/przypisane', this.Assignment?.Test));
        this.AppendChild(close_button);

        let heading = document.createElement('h2');
        this.AppendChild(heading);
        heading.textContent = 'Wyniki';

        let description = document.createElement('p');
        this.AppendChild(description);
        description.classList.add('secondary');
        description.textContent = 'W poniższej tabeli znajdują się wyniki wszystkich osób, z wyszczególnieniem, ile podejść wykorzystały.';
        description.appendChild(this.AttemptLimitText = document.createTextNode(''));

        this.ResultsTable = new ResultsTable();
        this.AppendChild(this.ResultsTable);
    }

    public async Populate(assignment: Assignment) {
        this.Assignment = assignment;
        if(assignment.AreAttemptsUnlimited()) {
            this.AttemptLimitText.textContent = ' Dla tego testu nie ustanowiono limitu podejść.';
        } else {
            let limit = assignment.AttemptLimit;
            this.AttemptLimitText.textContent = ' Dla tego testu ustanowiono limit ' + limit + ' podejś' + n(limit, 'cia', 'ć') + '.';
        }

        this.ResultsTable.Populate(assignment);
    }
}
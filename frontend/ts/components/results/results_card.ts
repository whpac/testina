import Card from '../basic/card';
import Assignment from '../../entities/assignment';
import ResultsTable from './results_table';
import { n } from '../../utils/textutils';

export default class ResultsCard extends Card {
    protected AttemptLimitText: Text;
    protected ResultsTable: ResultsTable;
    protected Assignment: Assignment | undefined;

    constructor() {
        super('semi-wide');

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
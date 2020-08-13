import Card from '../basic/card';
import Test from '../../entities/test';
import AssignmentsTable from './assignments_table';
import { GoToPage } from '../../1page/pagemanager';

export default class AssignmentsCard extends Card {
    protected Table: AssignmentsTable;

    constructor(){
        super('semi-wide');

        let close_button = document.createElement('button');
        close_button.classList.add('button', 'header-button');
        close_button.innerHTML = '<i class="fa fa-times icon"></i><span>Zamknij</span>';
        close_button.addEventListener('click', () => GoToPage('testy/biblioteka'));
        this.AppendChild(close_button);

        let heading = document.createElement('h2');
        heading.textContent = 'Przypisania';
        this.AppendChild(heading);

        let description = document.createElement('p');
        description.classList.add('secondary');
        description.textContent = 'Każdy wiersz tabeli odpowiada jednemu przypisaniu. Naciśnij przysisk „Wyniki”, aby zobaczyć indywidualne wyniki uczniów. Możesz także dopisać test dodatkowym osobom.';
        this.AppendChild(description);

        this.Table = new AssignmentsTable();
        this.AppendChild(this.Table);
    }

    async Populate(test: Test){
        let assignments = await test.GetAssignments();
        this.Table.Populate(assignments);
    }
}
import Card from '../basic/card';
import Test from '../../entities/test';
import AssignmentsTable from './assignments_table';

export default class AssignmentsCard extends Card {
    protected Table: AssignmentsTable;

    constructor() {
        super('semi-wide');

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

    async Populate(test: Test) {
        let assignments = await test.GetAssignments();
        this.Table.Populate(assignments);
    }
}
import AssignmentLoader from '../../entities/loaders/assignmentloader';
import Test from '../../entities/test';
import Card from '../basic/card';
import AssignedSurveysTable from './assigned_surveys_table';

export default class AssignedSurveysCard extends Card {
    protected AssignedSurveysTable: AssignedSurveysTable;

    public constructor() {
        super('semi-wide');

        let heading = document.createElement('h2');
        this.AppendChild(heading);
        heading.textContent = 'Ankiety udostępnione Tobie';

        let description = document.createElement('p');
        this.AppendChild(description);
        description.classList.add('secondary');
        description.textContent = 'Tutaj przedstawione są wszystkie ankiety, które Tobie udostępniono.';

        this.AssignedSurveysTable = new AssignedSurveysTable();
        this.AppendChild(this.AssignedSurveysTable);
    }

    public async Populate() {
        let assignments = await AssignmentLoader.GetAssignedToCurrentUser();
        assignments = assignments.filter((a) => a.Test.Type == Test.TYPE_SURVEY);
        this.AssignedSurveysTable.Populate(assignments);
    }
}
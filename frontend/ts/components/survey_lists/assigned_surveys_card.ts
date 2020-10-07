import AssignmentLoader from '../../entities/loaders/assignmentloader';
import Test from '../../entities/test';
import Card from '../basic/card';
import AssignedSurveysTable from './assigned_surveys_table';

export default class AssignedSurveysCard extends Card {
    protected AssignedSurveysTable: AssignedSurveysTable;
    public SurveyCount: number = 0;

    public constructor() {
        super('semi-wide');

        let heading = document.createElement('h2');
        this.AppendChild(heading);
        heading.textContent = 'Ankiety udostępnione Tobie';

        let description = document.createElement('p');
        this.AppendChild(description);
        description.classList.add('secondary');
        description.textContent = 'Tutaj przedstawione są wszystkie ankiety, które udostępniono Ci do wypełnienia.';

        this.AssignedSurveysTable = new AssignedSurveysTable();
        this.AppendChild(this.AssignedSurveysTable);
    }

    public async Populate() {
        let assignments = await AssignmentLoader.GetAssignedToCurrentUser();
        assignments = assignments.filter((a) => (a.Test.Type == Test.TYPE_SURVEY && !a.HasDeadlineExceeded()));
        this.SurveyCount = assignments.length;
        this.AssignedSurveysTable.Populate(assignments);
    }
}
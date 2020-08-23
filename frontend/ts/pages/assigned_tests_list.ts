import Page from '../components/basic/page';
import TestsToSolveTable from '../components/tests_lists/tests_to_solve_table';
import TestsSolvedTable from '../components/tests_lists/tests_solved_table';
import AssignmentLoader from '../entities/loaders/assignmentloader';

export default class AssignedTestsListPage extends Page {
    ToSolveTable: TestsToSolveTable;
    SolvedTable: TestsSolvedTable;
    IsPopulated: boolean = false;

    constructor() {
        super();

        let heading = document.createElement('h1');
        heading.textContent = 'Testy';
        this.Element.appendChild(heading);

        this.ToSolveTable = new TestsToSolveTable();
        this.Element.appendChild(this.ToSolveTable.GetElement());

        this.SolvedTable = new TestsSolvedTable();
        this.Element.appendChild(this.SolvedTable.GetElement());
    }

    async LoadInto(container: HTMLElement) {
        container.appendChild(this.Element);

        // Wrapped in a function in order to run asynchronously
        (async () => {
            if(this.IsPopulated) return;
            let assignments = await AssignmentLoader.GetAssignedToCurrentUser();
            this.ToSolveTable.Populate(assignments);
            this.SolvedTable.Populate(assignments);
            this.IsPopulated = true;
        })();
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return 'testy/lista';
    }

    async GetTitle() {
        return 'Testy';
    }
}
import Page from '../components/basic/page';
import TestsToSolveTable from '../components/tests_lists/tests_to_solve_table';
import TestsSolvedTable from '../components/tests_lists/tests_solved_table';
import AssignmentLoader from '../entities/loaders/assignmentloader';
import AllTestsSolved from '../components/tests_lists/empty_states/all_tests_solved';
import NoTests from '../components/tests_lists/empty_states/no_tests';
import Test from '../entities/test';
import Toast from '../components/basic/toast';

export default class AssignedTestsListPage extends Page {
    ToSolveTable: TestsToSolveTable;
    SolvedTable: TestsSolvedTable;
    AllTestsSolved: AllTestsSolved;
    NoTests: NoTests;

    constructor() {
        super();

        let heading = document.createElement('h1');
        heading.textContent = 'Testy';
        this.Element.appendChild(heading);

        this.NoTests = new NoTests(true);
        this.AppendChild(this.NoTests);

        this.ToSolveTable = new TestsToSolveTable();
        this.AppendChild(this.ToSolveTable);

        this.AllTestsSolved = new AllTestsSolved(true);
        this.AppendChild(this.AllTestsSolved);

        this.SolvedTable = new TestsSolvedTable();
        this.AppendChild(this.SolvedTable);
    }

    async LoadInto(container: HTMLElement) {
        container.appendChild(this.Element);

        // Zawinięte w funkcję inline, aby działało niezależnie
        (async () => {
            try {
                this.AllTestsSolved.GetElement().style.display = 'none';
                this.NoTests.GetElement().style.display = 'none';
                let assignments = await AssignmentLoader.GetAssignedToCurrentUser();
                assignments = assignments.filter((a) => a.Test.Type == Test.TYPE_TEST);
                this.ToSolveTable.Populate(assignments);
                this.SolvedTable.Populate(assignments);
                if(this.ToSolveTable.RowCount == 0) {
                    if(this.SolvedTable.RowCount == 0) {
                        this.GoToCompletelyEmptyState();
                    } else {
                        this.GoToEmptyStateNoCurrent();
                    }
                }
            } catch(e) {
                let message = '.';
                if('Message' in e) message = ': ' + e.Message;

                new Toast('Nie udało się wczytać testów' + message).Show(0);
            }
        })();
    }

    protected GoToEmptyStateNoCurrent() {
        this.ToSolveTable.GetElement().style.display = 'none';
        this.AllTestsSolved.GetElement().style.display = '';
    }

    protected GoToCompletelyEmptyState() {
        this.ToSolveTable.GetElement().style.display = 'none';
        this.SolvedTable.GetElement().style.display = 'none';
        this.NoTests.GetElement().style.display = '';
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return 'testy/lista';
    }

    GetTitle() {
        return 'Testy';
    }
}
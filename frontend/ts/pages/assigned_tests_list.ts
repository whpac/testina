import Page from '../components/basic/page';
import TestsToSolveTable from '../components/tests_lists/tests_to_solve_table';
import Assignment from '../entities/assignment';
import TestsSolvedTable from '../components/tests_lists/tests_solved_table';

export default class AssignedTestsListPage extends Page{
    ToSolveTable: TestsToSolveTable;
    SolvedTable: TestsSolvedTable;

    constructor(){
        super();

        let heading = document.createElement('h1');
        heading.textContent = 'Testy';
        this.Element.appendChild(heading);

        this.ToSolveTable = new TestsToSolveTable();
        this.Element.appendChild(this.ToSolveTable.GetElement());

        this.SolvedTable = new TestsSolvedTable();
        this.Element.appendChild(this.SolvedTable.GetElement());
    }

    async LoadInto(container: HTMLElement){
        container.appendChild(this.Element);
        
        // Wrapped in a function in order to run asynchronously
        (async () => {
            let assignments = await Assignment.GetAll();
            this.ToSolveTable.Populate(assignments);
            this.SolvedTable.Populate(assignments);
        })();
    }

    UnloadFrom(container: HTMLElement){
        container.removeChild(this.Element);
    }

    GetUrlPath(){
        return 'testy/lista';
    }

    async GetTitle(){
        return 'Testy';
    }
}
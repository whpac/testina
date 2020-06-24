import Page from '../1page/page';
import TestsToSolveTable from '../components/tests_to_solve_table';
import Assignment from '../entities/assignment';

export default class AssignedTestsList extends Page{
    PageElem: HTMLElement;
    ToSolveTable: TestsToSolveTable;

    constructor(){
        super();

        this.PageElem = document.createElement('div');

        let heading = document.createElement('h1');
        heading.textContent = 'Testy';
        this.PageElem.appendChild(heading);

        this.ToSolveTable = new TestsToSolveTable();
        this.PageElem.appendChild(this.ToSolveTable.GetElement());
    }

    async LoadInto(container: HTMLElement){
        container.appendChild(this.PageElem);
        
        // Wrapped in a function in order to run asynchronously
        (async () => {
            let assignments = await Assignment.GetAll();
            this.ToSolveTable.Populate(assignments);
        })();
    }

    UnloadFrom(container: HTMLElement){
        container.removeChild(this.PageElem);
    }

    GetUrlPath(){
        return 'testy/lista';
    }

    async GetTitle(){
        return 'Testy';
    }
}
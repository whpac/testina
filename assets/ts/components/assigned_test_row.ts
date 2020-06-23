import Component from './component';

export default class AssignedTestRow extends Component {
    NameCell: HTMLTableCellElement;
    DeadlineCell: HTMLTableCellElement;
    AssignedCell: HTMLTableCellElement;
    AuthorCell: HTMLTableCellElement;
    ScoreCell: HTMLTableCellElement;
    AttemptsCell: HTMLTableCellElement;

    constructor(){
        super();

        this.Element = document.createElement('tr');

        this.NameCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.DeadlineCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.AssignedCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.AssignedCell.classList.add('wide-screen-only');
        this.AuthorCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.AuthorCell.classList.add('wide-screen-only');
        this.ScoreCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.ScoreCell.classList.add('wide-screen-only');
        this.AttemptsCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.AttemptsCell.classList.add('wide-screen-only');

        let solve_cell = (this.Element as HTMLTableRowElement).insertCell(-1);
        let solve_btn = document.createElement('button');
        solve_btn.classList.add('compact', 'wide-screen-only', 'todo');
        solve_btn.textContent = 'Rozwiąż';
        solve_cell.appendChild(solve_btn);
        let details_btn = document.createElement('button');
        details_btn.classList.add('narrow-screen-only', 'fa', 'fa-ellipsis-h');
        solve_cell.appendChild(details_btn);
    }
}
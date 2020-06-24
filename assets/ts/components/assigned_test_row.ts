import Component from './component';
import Assignment from '../entities/assignment';

import * as DateUtils from '../dateutils';

export default class AssignedTestRow extends Component {
    NameCell: HTMLTableCellElement;
    DeadlineCell: HTMLTableCellElement;
    AssignedCell: HTMLTableCellElement;
    AuthorCell: HTMLTableCellElement;
    ScoreCell: HTMLTableCellElement;
    AttemptsCell: HTMLTableCellElement;

    constructor(assignment: Assignment){
        super();

        this.Element = document.createElement('tr');

        this.NameCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.DeadlineCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.DeadlineCell.classList.add('center');
        this.AssignedCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.AssignedCell.classList.add('wide-screen-only', 'center');
        this.AuthorCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.AuthorCell.classList.add('wide-screen-only', 'center');
        this.ScoreCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.ScoreCell.classList.add('wide-screen-only', 'center', 'todo');
        this.AttemptsCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.AttemptsCell.classList.add('wide-screen-only', 'center');

        let solve_cell = (this.Element as HTMLTableRowElement).insertCell(-1);
        let solve_btn = document.createElement('button');
        solve_btn.classList.add('compact', 'wide-screen-only', 'todo');
        solve_btn.textContent = 'Rozwiąż';
        solve_cell.appendChild(solve_btn);
        let details_btn = document.createElement('button');
        details_btn.classList.add('narrow-screen-only', 'fa', 'fa-ellipsis-h', 'todo');
        solve_cell.appendChild(details_btn);

        this.Populate(assignment);
    }

    async Populate(assignment: Assignment){
        this.NameCell.textContent = await (await assignment.GetTest()).GetName();
        this.DeadlineCell.textContent = DateUtils.ToDayHourFormat(await assignment.GetTimeLimit());
        this.AssignedCell.textContent = DateUtils.ToDayFormat(await assignment.GetAssignmentDate());
        //this.AuthorCell.textContent = await (await (await assignment.GetTest()).GetAuthor()).GetName();
        
        let score = await assignment.GetScore();
        if(score === null){
            this.ScoreCell.textContent = '—';
        }else{
            this.ScoreCell.textContent = '';

            let score_link = document.createElement('a');
            score_link.title = 'Zobacz szczegóły wyniku';
            score_link.href = '#';
            score_link.textContent = score + '%';
            this.ScoreCell.appendChild(score_link);
        }

        let attempts = await assignment.GetAttemptCount();
        let attempt_limit = await assignment.GetAttemptLimit();
        this.AttemptsCell.textContent =
            attempts.toString() + ((attempt_limit > 0) ? ('/' + attempt_limit.toString()) : '');
    }
}
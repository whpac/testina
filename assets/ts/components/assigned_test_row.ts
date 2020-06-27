import Component from './component';
import Assignment from '../entities/assignment';

import * as DateUtils from '../dateutils';
import { HandleLinkClick } from '../script';

export default class AssignedTestRow extends Component {
    NameCell: HTMLTableCellElement;
    DeadlineCell: HTMLTableCellElement;
    AssignedCell: HTMLTableCellElement;
    AuthorCell: HTMLTableCellElement;
    ScoreCell: HTMLTableCellElement;
    AttemptsCell: HTMLTableCellElement;
    ButtonsCell: HTMLTableCellElement;
    SolveButton: HTMLAnchorElement;

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

        this.ButtonsCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.ButtonsCell.classList.add('right');

        this.SolveButton = document.createElement('a');
        this.SolveButton.classList.add('button', 'compact', 'wide-screen-only', 'todo');
        this.SolveButton.textContent = 'Rozwiąż';
        this.ButtonsCell.appendChild(this.SolveButton);

        let details_btn = document.createElement('button');
        details_btn.classList.add('narrow-screen-only', 'fa', 'fa-ellipsis-h', 'todo');
        this.ButtonsCell.appendChild(details_btn);

        this.Populate(assignment);
    }

    async Populate(assignment: Assignment){
        this.NameCell.textContent = await (await assignment.GetTest()).GetName();
        this.DeadlineCell.textContent = DateUtils.ToDayHourFormat(await assignment.GetTimeLimit());
        this.AssignedCell.textContent = DateUtils.ToDayFormat(await assignment.GetAssignmentDate());
        this.AssignedCell.title = DateUtils.ToDayHourFormat(await assignment.GetAssignmentDate());
        this.AuthorCell.textContent = await (await (await assignment.GetTest()).GetAuthor()).GetName();
        
        let score = await assignment.GetScore();
        if(score === null){
            this.ScoreCell.textContent = '—';
        }else{
            this.ScoreCell.textContent = '';

            let score_link = document.createElement('a');
            score_link.title = 'Zobacz szczegóły wyniku';
            score_link.href = 'javascript:void(0)';
            score_link.textContent = score + '%';
            this.ScoreCell.appendChild(score_link);
        }

        let attempts = await assignment.GetAttemptCount();
        let attempt_limit = await assignment.GetAttemptLimit();
        this.AttemptsCell.textContent =
            attempts.toString() + ((attempt_limit > 0) ? ('/' + attempt_limit.toString()) : '');
        
        if(!(await assignment.IsActive())){
            this.SolveButton.remove();
            this.ButtonsCell.classList.add('narrow-screen-only');

            this.DeadlineCell.title = this.DeadlineCell.textContent;
            this.DeadlineCell.textContent = DateUtils.ToDayFormat(await assignment.GetTimeLimit());

            this.Element.insertBefore(this.ScoreCell, this.DeadlineCell);
            this.Element.insertBefore(this.AssignedCell, this.DeadlineCell);
        }else{
            this.SolveButton.href = 'testy/rozwiąż/' + assignment.GetId();
            this.SolveButton.addEventListener('click', (e) => HandleLinkClick(e, 'testy/rozwiąż', assignment));
        }
    }
}
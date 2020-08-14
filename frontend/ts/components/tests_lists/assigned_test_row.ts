import Component from '../basic/component';
import Assignment from '../../entities/assignment';

import * as DateUtils from '../../utils/dateutils';
import { HandleLinkClick } from '../../1page/pagemanager';
import ScoreDetailsDialog from './score_details_dialog';
import AssignmentDetailsDialog from './assignment_details_dialog';

export default class AssignedTestRow extends Component {
    NameCell: HTMLTableCellElement;
    DeadlineCell: HTMLTableCellElement;
    AssignedCell: HTMLTableCellElement;
    AuthorCell: HTMLTableCellElement;
    ScoreCell: HTMLTableCellElement;
    AttemptsCell: HTMLTableCellElement;
    ButtonsCell: HTMLTableCellElement;
    SolveButton: HTMLAnchorElement;
    DetailsButton: HTMLButtonElement;

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
        this.ScoreCell.classList.add('wide-screen-only', 'center');
        this.AttemptsCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.AttemptsCell.classList.add('wide-screen-only', 'center');

        this.ButtonsCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.ButtonsCell.classList.add('right');

        this.SolveButton = document.createElement('a');
        this.SolveButton.classList.add('button', 'compact', 'wide-screen-only');
        this.SolveButton.textContent = 'Rozwiąż';
        this.ButtonsCell.appendChild(this.SolveButton);

        this.DetailsButton = document.createElement('button');
        this.DetailsButton.classList.add('narrow-screen-only', 'fa', 'fa-ellipsis-h', 'only-child');
        this.ButtonsCell.appendChild(this.DetailsButton);

        this.Populate(assignment);
    }

    public async Populate(assignment: Assignment){
        this.NameCell.textContent = assignment.Test.Name;
        this.DeadlineCell.textContent = DateUtils.ToDayHourFormat(assignment.Deadline);
        this.AssignedCell.textContent = DateUtils.ToDayFormat(assignment.AssignmentDate);
        this.AssignedCell.title = DateUtils.ToDayHourFormat(assignment.AssignmentDate);
        this.AuthorCell.textContent = assignment.Test.Author.GetFullName();
        
        let score = assignment.Score;
        if(score === undefined){
            this.ScoreCell.textContent = '—';
        }else{
            this.ScoreCell.textContent = '';

            let score_link = document.createElement('a');
            score_link.title = 'Zobacz szczegóły wyniku';
            score_link.href = 'javascript:void(0)';
            score_link.addEventListener('click', () => this.DisplayScoreDetailsDialog(assignment));
            score_link.textContent = score + '%';
            this.ScoreCell.appendChild(score_link);
        }

        this.DetailsButton.addEventListener('click', () => this.DisplayAssignmentDetailsDialog(assignment));

        let attempts = assignment.AttemptCount;
        let attempt_limit = assignment.AttemptLimit;
        this.AttemptsCell.textContent =
            attempts.toString() + ((attempt_limit > 0) ? ('/' + attempt_limit.toString()) : '');
        
        if(!assignment.IsActive()){
            this.SolveButton.remove();
            this.ButtonsCell.classList.add('narrow-screen-only');

            this.DeadlineCell.title = this.DeadlineCell.textContent;
            this.DeadlineCell.textContent = DateUtils.ToDayFormat(assignment.Deadline);

            this.Element.insertBefore(this.ScoreCell, this.DeadlineCell);
            this.Element.insertBefore(this.AssignedCell, this.DeadlineCell);
        }else{
            this.SolveButton.href = 'testy/rozwiąż/' + assignment.Id;
            this.SolveButton.addEventListener('click', (e) => HandleLinkClick(e, 'testy/rozwiąż', assignment));
        }
    }

    protected DisplayScoreDetailsDialog(assignment: Assignment){
        let dialog = new ScoreDetailsDialog();
        dialog.Populate(assignment);
        dialog.Show();
    }

    protected DisplayAssignmentDetailsDialog(assignment: Assignment){
        let dialog = new AssignmentDetailsDialog();
        dialog.Populate(assignment);
        dialog.Show();
    }
}
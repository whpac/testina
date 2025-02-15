import Component from '../basic/component';
import Assignment from '../../entities/assignment';

import * as DateUtils from '../../utils/dateutils';
import { HandleLinkClick } from '../../1page/page_manager';
import ScoreDetailsDialog from './score_details_dialog';
import AssignmentDetailsDialog from './assignment_details_dialog';
import Icon from '../basic/icon';

export default class AssignedTestRow extends Component {
    NameCell: HTMLTableCellElement;
    DeadlineCell: HTMLTableCellElement;
    AssignedCell: HTMLTableCellElement;
    AuthorCell: HTMLTableCellElement;
    ScoreCell: HTMLTableCellElement;
    AttemptsCell: HTMLTableCellElement;
    SolveCell: HTMLTableCellElement;
    DetailsCell: HTMLTableCellElement;
    SolveButton: HTMLAnchorElement;
    DetailsButton: HTMLButtonElement;

    constructor(assignment: Assignment) {
        super();

        this.Element = document.createElement('tr');

        this.NameCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.DeadlineCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.DeadlineCell.classList.add('center');
        this.AssignedCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.AssignedCell.classList.add('xlarge-screen-only', 'center');
        this.AuthorCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.AuthorCell.classList.add('wide-screen-only', 'center');
        this.ScoreCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.ScoreCell.classList.add('wide-screen-only', 'center');
        this.AttemptsCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.AttemptsCell.classList.add('xlarge-screen-only', 'center');

        this.SolveCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.SolveCell.classList.add('right', 'wide-screen-only');

        this.SolveButton = document.createElement('a');
        this.SolveButton.classList.add('button', 'compact');
        this.SolveButton.textContent = 'Rozwiąż';
        this.SolveCell.appendChild(this.SolveButton);

        this.DetailsCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.DetailsCell.classList.add('right', 'not-xlarge-screen');

        this.DetailsButton = document.createElement('button');
        this.DetailsButton.classList.add('fa', 'fa-ellipsis-h');
        this.DetailsCell.appendChild(this.DetailsButton);

        this.Populate(assignment);
    }

    public Populate(assignment: Assignment) {
        this.NameCell.textContent = assignment.Test.Name;
        this.DeadlineCell.textContent = DateUtils.ToDayHourFormat(assignment.Deadline);
        this.AssignedCell.textContent = DateUtils.ToDayFormat(assignment.AssignmentDate);
        this.AssignedCell.title = DateUtils.ToDayHourFormat(assignment.AssignmentDate);
        this.AuthorCell.textContent = assignment.Test.Author.GetFullName();

        this.DisplayScore(assignment);
        assignment.AddEventListener('change', (() => this.DisplayScore(assignment)).bind(this));

        this.DetailsButton.addEventListener('click', () => this.DisplayAssignmentDetailsDialog(assignment));

        let attempts = assignment.AttemptCount;
        let attempt_limit = assignment.AttemptLimit;
        this.AttemptsCell.textContent =
            attempts.toString() + ((attempt_limit > 0) ? ('/' + attempt_limit.toString()) : '');

        if(!assignment.IsActive()) {
            this.SolveCell.remove();

            this.DeadlineCell.title = this.DeadlineCell.textContent;
            this.DeadlineCell.textContent = DateUtils.ToDayFormat(assignment.Deadline);

            this.Element.insertBefore(this.ScoreCell, this.DeadlineCell);
            this.Element.insertBefore(this.AssignedCell, this.DeadlineCell);
        } else {
            this.SolveButton.href = 'testy/rozwiąż/' + assignment.Id;
            this.SolveButton.addEventListener('click', (e) => HandleLinkClick(e, 'testy/rozwiąż', assignment));
        }
    }

    protected DisplayScore(assignment: Assignment) {
        let score = assignment.Score;
        if(score === undefined) {
            if(assignment.AttemptCount == 0) {
                this.ScoreCell.textContent = '—';
            } else {
                this.ScoreCell.textContent = '';
                this.ScoreCell.appendChild(new Icon('hourglass-half').GetElement());
                this.ScoreCell.title = 'Nauczyciel nie ocenił jeszcze tego testu.';
            }
        } else {
            this.ScoreCell.textContent = '';

            let score_link = document.createElement('a');
            score_link.title = 'Zobacz szczegóły wyniku';
            score_link.href = 'javascript:void(0)';
            score_link.addEventListener('click', () => this.DisplayScoreDetailsDialog(assignment));
            score_link.textContent = score + '%';
            this.ScoreCell.appendChild(score_link);
        }
    }

    protected DisplayScoreDetailsDialog(assignment: Assignment) {
        let dialog = new ScoreDetailsDialog();
        dialog.Populate(assignment);
        dialog.Show();
    }

    protected DisplayAssignmentDetailsDialog(assignment: Assignment) {
        let dialog = new AssignmentDetailsDialog();
        dialog.Populate(assignment);
        dialog.Show();
    }
}
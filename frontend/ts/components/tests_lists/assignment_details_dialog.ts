import Dialog from '../basic/dialog';
import Assignment from '../../entities/assignment';
import ScoreDetailsDialog from './score_details_dialog';
import * as DateUtils from '../../utils/dateutils';
import * as PageManager from '../../1page/pagemanager';

export default class AssignmentDetailsDialog extends Dialog {
    protected DeadlineCell: HTMLTableCellElement;
    protected AssignmentDateCell: HTMLTableCellElement;
    protected ScoreCell: HTMLTableCellElement;
    protected AuthorCell: HTMLTableCellElement;
    protected AttemptsLeftCell: HTMLTableCellElement;
    protected SolveButton: HTMLButtonElement;

    constructor() {
        super();

        let table = document.createElement('table');
        table.classList.add('table', 'full-width');
        this.AddContent(table);
        let tr_heading = table.insertRow(-1);
        tr_heading.appendChild(document.createElement('th'));
        tr_heading.appendChild(document.createElement('th'));

        let tr_deadline = table.insertRow(-1);
        let th_deadline = document.createElement('th');
        th_deadline.textContent = 'Termin rozwiązania';
        tr_deadline.appendChild(th_deadline);
        this.DeadlineCell = tr_deadline.insertCell(-1);
        this.DeadlineCell.classList.add('center');

        let tr_assignment_date = table.insertRow(-1);
        let th_assignment_date = document.createElement('th');
        th_assignment_date.textContent = 'Data przypisania';
        tr_assignment_date.appendChild(th_assignment_date);
        this.AssignmentDateCell = tr_assignment_date.insertCell(-1);
        this.AssignmentDateCell.classList.add('center');

        let tr_score = table.insertRow(-1);
        let th_score = document.createElement('th');
        th_score.textContent = 'Twój wynik';
        tr_score.appendChild(th_score);
        this.ScoreCell = tr_score.insertCell(-1);
        this.ScoreCell.classList.add('center');

        let tr_author = table.insertRow(-1);
        let th_author = document.createElement('th');
        th_author.textContent = 'Autor testu';
        tr_author.appendChild(th_author);
        this.AuthorCell = tr_author.insertCell(-1);
        this.AuthorCell.classList.add('center');

        let tr_attempts_left = table.insertRow(-1);
        let th_attempts_left = document.createElement('th');
        th_attempts_left.textContent = 'Pozostało prób';
        tr_attempts_left.appendChild(th_attempts_left);
        this.AttemptsLeftCell = tr_attempts_left.insertCell(-1);
        this.AttemptsLeftCell.classList.add('center');

        let close_btn = document.createElement('button');
        close_btn.textContent = 'Zamknij';
        close_btn.addEventListener('click', this.Hide.bind(this));
        this.AddButton(close_btn);

        this.SolveButton = document.createElement('button');
        this.SolveButton.textContent = 'Rozwiąż';
        this.SolveButton.classList.add('secondary');
        this.AddButton(this.SolveButton);
    }

    public async Populate(assignment: Assignment) {
        let test = assignment.Test;
        this.SetHeader(test.Name);

        this.DeadlineCell.textContent = DateUtils.ToDayHourFormat(assignment.Deadline);
        if(assignment.HasDeadlineExceeded()) {
            this.DeadlineCell.classList.add('error');
        }

        this.AssignmentDateCell.textContent = DateUtils.ToDayHourFormat(assignment.AssignmentDate);

        let avg_score = assignment.Score;
        if(avg_score === null) {
            this.ScoreCell.textContent = '—';
        } else {
            let score_link = document.createElement('a');
            score_link.title = 'Zobacz szczegóły wyniku';
            score_link.href = 'javascript:void(0)';
            score_link.addEventListener('click', () => this.DisplayScoreDetailsDialog(assignment));
            score_link.textContent = avg_score + '%';
            this.ScoreCell.textContent = '';
            this.ScoreCell.appendChild(score_link);
        }

        this.AuthorCell.textContent = test.Author.GetFullName();

        if(assignment.AreAttemptsUnlimited()) {
            this.AttemptsLeftCell.textContent = 'bez ograniczeń';
        } else {
            let remaining_attempts_count = assignment.GetRemainingAttemptsCount();
            if(remaining_attempts_count < 0) remaining_attempts_count = 0;

            this.AttemptsLeftCell.textContent = remaining_attempts_count.toString();
            if(remaining_attempts_count == 0) {
                this.AttemptsLeftCell.classList.add('error');
            }
        }

        if(assignment.IsActive()) {
            this.SolveButton.addEventListener('click', () => this.ProceedToSolvePage(assignment));
        } else {
            this.SolveButton.remove();
        }
    }

    protected DisplayScoreDetailsDialog(assignment: Assignment) {
        let dialog = new ScoreDetailsDialog();
        dialog.Populate(assignment);
        dialog.Show();
    }

    protected ProceedToSolvePage(assignment: Assignment) {
        this.Hide();
        PageManager.GoToPage('testy/rozwiąż', assignment);
    }
}
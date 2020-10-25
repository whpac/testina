import Dialog from '../basic/dialog';
import Assignment from '../../entities/assignment';
import Attempt from '../../entities/attempt';
import { ToDayHourFormat } from '../../utils/dateutils';
import Test from '../../entities/test';
import User from '../../entities/user';
import UserLoader from '../../entities/loaders/userloader';
import { GoToPage } from '../../1page/page_manager';

export default class ScoreDetailsDialog extends Dialog {
    TBody: HTMLTableSectionElement;
    ButtonColumnHeader: HTMLTableHeaderCellElement;

    constructor() {
        super();

        let table = document.createElement('table');
        table.classList.add('table', 'full-width');
        this.AddContent(table);

        let header = table.createTHead().insertRow(-1);
        let th_date = document.createElement('th');
        th_date.textContent = 'Data rozpoczęcia';
        header.appendChild(th_date);

        let th_score = document.createElement('th');
        th_score.textContent = 'Wynik';
        header.appendChild(th_score);

        this.ButtonColumnHeader = document.createElement('th');
        header.appendChild(this.ButtonColumnHeader);

        this.TBody = table.createTBody();
        this.TBody.classList.add('content-tbody');

        let nocontent = table.createTBody();
        nocontent.classList.add('nocontent-tbody');
        let tr = nocontent.insertRow();
        tr.insertCell().textContent = 'Wczytywanie...';
        tr.insertCell();
        tr.insertCell();

        let close_btn = document.createElement('button');
        close_btn.textContent = 'Zamknij';
        close_btn.addEventListener('click', this.Hide.bind(this));
        this.AddButton(close_btn);
    }

    async Populate(assignment: Assignment, user: User | undefined = undefined) {
        let attempts_awaiter;
        if(user === undefined) {
            attempts_awaiter = assignment.GetAttemptsForCurrentUser();
        } else {
            attempts_awaiter = assignment.GetAttemptsForUser(user);
        }

        let display_more = (assignment.AssignedBy.Id === (await UserLoader.GetCurrent())?.Id);
        this.ButtonColumnHeader.style.display = display_more ? '' : 'none';

        let test = assignment.Test;
        this.SetHeader((user !== undefined ? (user.GetFullName() + ' – ') : '') + test.Name);

        let attempts = await attempts_awaiter;
        for(let attempt of attempts) {
            let tr = this.TBody.insertRow(-1);

            let td_date = tr.insertCell(-1);
            td_date.classList.add('center');
            td_date.textContent = ToDayHourFormat(attempt.BeginTime);

            let td_score = tr.insertCell(-1);
            td_score.classList.add('center');
            td_score.textContent = attempt.GetPercentageScore() + '%';

            if(display_more) {
                let td_btn = tr.insertCell(-1);
                td_btn.classList.add('center');

                let more_btn = document.createElement('button');
                more_btn.classList.add('compact', 'todo');
                more_btn.classList.add('fa', 'fa-ellipsis-h');
                more_btn.title = 'Wyświetl odpowiedzi';
                td_btn.appendChild(more_btn);

                more_btn.addEventListener('click', (() => {
                    this.Hide();
                    GoToPage('podejścia', attempt);
                }));
            }
        }

        let avg_tr = this.TBody.insertRow(-1);
        let em_avg: HTMLElement, em_score: HTMLElement;

        let td_caption = avg_tr.insertCell(-1);
        td_caption.classList.add('center');
        td_caption.appendChild(em_avg = document.createElement('em'));

        let td_avg_score = avg_tr.insertCell(-1);
        td_avg_score.classList.add('center');
        td_avg_score.appendChild(em_score = document.createElement('em'));

        if(display_more) {
            avg_tr.insertCell(-1);
        }

        em_avg.textContent = assignment.Test.ScoreCounting == Test.SCORE_BEST ? 'Najlepszy:' : 'Średnia:';
        if(user === undefined) {
            em_score.textContent = assignment.Score + '%';
        } else {
            let score = assignment.GetScoreForUser(user);
            if(score === null) em_score.textContent = 'Nieznany';
            else em_score.textContent = score + '%';
        }
    }
}
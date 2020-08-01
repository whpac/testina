import Dialog from '../basic/dialog';
import Assignment from '../../entities/assignment';
import Attempt from '../../entities/attempt';
import { ToDayHourFormat } from '../../utils/dateutils';

export default class ScoreDetailsDialog extends Dialog{
    TBody: HTMLTableSectionElement;

    constructor(){
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

        this.TBody = table.createTBody();
        this.TBody.classList.add('content-tbody');

        let nocontent = table.createTBody();
        nocontent.classList.add('nocontent-tbody');
        let tr = nocontent.insertRow();
        tr.insertCell().textContent = 'Wczytywanie...';
        tr.insertCell();

        let close_btn = document.createElement('button');
        close_btn.textContent = 'Zamknij';
        close_btn.addEventListener('click', this.Hide.bind(this));
        this.AddButton(close_btn);
    }

    async Populate(assignment: Assignment){
        let attempts_awaiter = assignment.GetAttempts();
        
        let test = assignment.Test;
        this.SetHeader(test.Name);

        let attempts = await attempts_awaiter;
        for(let attempt of attempts){
            let tr = this.TBody.insertRow(-1);
            
            let td_date = tr.insertCell(-1);
            td_date.classList.add('center');
            td_date.textContent = ToDayHourFormat(attempt.BeginTime);

            let td_score = tr.insertCell(-1);
            td_score.classList.add('center');
            td_score.textContent = attempt.GetPercentageScore() + '%';
        }

        let avg_tr = this.TBody.insertRow(-1);
        let em_avg: HTMLElement, em_score: HTMLElement;

        let td_caption = avg_tr.insertCell(-1);
        td_caption.classList.add('center');
        td_caption.appendChild(em_avg = document.createElement('em'));

        let td_avg_score = avg_tr.insertCell(-1);
        td_avg_score.classList.add('center');
        td_avg_score.appendChild(em_score = document.createElement('em'));

        em_avg.textContent = 'Średnia:';
        em_score.textContent = assignment.Score + '%';
    }
}
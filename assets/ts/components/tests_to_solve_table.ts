import Card from './card';
import AssignedTestRow from './assigned_test_row';
import Assignment from '../entities/assignment';

export default class TestsToSolveTable extends Card {
    ContentWrapper: HTMLTableSectionElement;

    constructor(){
        super();

        this.GetElement().classList.add('semi-wide');

        let heading = document.createElement('h2');
        heading.textContent = 'Do rozwiązania';
        this.AppendChild(heading);

        let table = document.createElement('table');
        table.classList.add('table', 'full-width');
        this.AppendChild(table);

        /*let colgroup = document.createElement('colgroup');
        let col_shrink = document.createElement('col');
        col_shrink.classList.add('shrink');
        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(col_shrink.cloneNode(false));
        colgroup.appendChild(col_shrink.cloneNode(false));
        colgroup.appendChild(col_shrink.cloneNode(false));
        colgroup.appendChild(col_shrink.cloneNode(false));
        colgroup.appendChild(col_shrink.cloneNode(false));
        colgroup.appendChild(col_shrink.cloneNode(false));
        table.appendChild(colgroup);*/

        let colgroup = document.createElement('colgroup');
        let col_shrink = document.createElement('col');
        col_shrink.classList.add('shrink');
        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(col_shrink.cloneNode(false));
        table.appendChild(colgroup);

        let thead = table.createTHead();
        let thead_tr = table.insertRow(-1);

        let th_name = document.createElement('th');
        th_name.textContent = 'Nazwa';
        thead_tr.appendChild(th_name);

        let th_deadline = document.createElement('th');
        th_deadline.textContent = 'Termin';
        thead_tr.appendChild(th_deadline);

        let th_assigned = document.createElement('th');
        th_assigned.classList.add('wide-screen-only');
        th_assigned.textContent = 'Przypisano';
        thead_tr.appendChild(th_assigned);

        let th_author = document.createElement('th');
        th_author.classList.add('wide-screen-only');
        th_author.textContent = 'Autor';
        thead_tr.appendChild(th_author);

        let th_score = document.createElement('th');
        th_score.classList.add('wide-screen-only');
        th_score.textContent = 'Wynik';
        thead_tr.appendChild(th_score);

        let th_attempts = document.createElement('th');
        th_attempts.classList.add('wide-screen-only');
        th_attempts.textContent = 'Prób';
        thead_tr.appendChild(th_attempts);

        thead_tr.appendChild(document.createElement('th'));

        this.ContentWrapper = table.createTBody();
        this.ContentWrapper.classList.add('content-tbody');

        let nocontent_tbody = table.createTBody();
        nocontent_tbody.classList.add('nocontent-tbody');
        let tr = nocontent_tbody.insertRow();

        tr.insertCell().textContent = 'Wczytywanie...';
        tr.insertCell();
        tr.insertCell().classList.add('wide-screen-only');
        tr.insertCell().classList.add('wide-screen-only');
        tr.insertCell().classList.add('wide-screen-only');
        tr.insertCell().classList.add('wide-screen-only');
        tr.insertCell();
    }

    Populate(assignments: Assignment[]){
        for(let i = assignments.length - 1; i >= 0; i--){
            this.ContentWrapper.appendChild(new AssignedTestRow(assignments[i]).GetElement());
        }
    }
}
import Card from '../basic/card';
import AssignedTestRow from './assigned_test_row';
import Assignment from '../../entities/assignment';
import UserLoader from '../../entities/loaders/userloader';

export default class TestsSolvedTable extends Card {
    ContentWrapper: HTMLTableSectionElement;
    Subheading: HTMLParagraphElement;
    RowCount: number = 0;

    constructor() {
        super();

        this.GetElement().classList.add('semi-wide');

        let heading = document.createElement('h2');
        heading.textContent = 'Już zakończone';
        this.AppendChild(heading);

        this.Subheading = document.createElement('p');
        this.Subheading.classList.add('secondary');
        this.AppendChild(this.Subheading);

        let table = document.createElement('table');
        table.classList.add('table', 'full-width');
        this.AppendChild(table);

        let colgroup = document.createElement('colgroup');
        let col_shrink = document.createElement('col');
        col_shrink.classList.add('shrink', 'narrow-screen-only');

        let col_widescreen = document.createElement('col');
        col_widescreen.classList.add('wide-screen-only');

        let col_xlargescreen = document.createElement('col');
        col_xlargescreen.classList.add('xlarge-screen-only');

        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(col_widescreen.cloneNode(false));
        colgroup.appendChild(col_xlargescreen.cloneNode(false));
        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(col_widescreen.cloneNode(false));
        colgroup.appendChild(col_widescreen.cloneNode(false));
        colgroup.appendChild(col_shrink.cloneNode(false));
        colgroup.appendChild(col_shrink.cloneNode(false));
        table.appendChild(colgroup);

        let thead = table.createTHead();
        let thead_tr = thead.insertRow(-1);

        let th_name = document.createElement('th');
        th_name.textContent = 'Nazwa';
        thead_tr.appendChild(th_name);

        let th_score = document.createElement('th');
        th_score.classList.add('wide-screen-only');
        th_score.textContent = 'Wynik';
        thead_tr.appendChild(th_score);

        let th_assigned = document.createElement('th');
        th_assigned.classList.add('xlarge-screen-only');
        th_assigned.textContent = 'Przypisano';
        thead_tr.appendChild(th_assigned);

        let th_deadline = document.createElement('th');
        th_deadline.textContent = 'Termin';
        thead_tr.appendChild(th_deadline);

        let th_author = document.createElement('th');
        th_author.classList.add('wide-screen-only');
        th_author.textContent = 'Autor';
        thead_tr.appendChild(th_author);

        let th_attempts = document.createElement('th');
        th_attempts.classList.add('xlarge-screen-only');
        th_attempts.textContent = 'Podejść';
        thead_tr.appendChild(th_attempts);

        let th_details = document.createElement('th');
        th_details.classList.add('not-xlarge-screen');
        thead_tr.appendChild(th_details);

        this.ContentWrapper = table.createTBody();
        this.ContentWrapper.classList.add('content-tbody');

        let nocontent_tbody = table.createTBody();
        nocontent_tbody.classList.add('nocontent-tbody');
        let tr = nocontent_tbody.insertRow();

        let cell = tr.insertCell();
        (async () => cell.textContent = 'Nie rozwiązał' + ((await UserLoader.GetCurrent())?.IsFemale() ? 'a' : 'e') + 'ś jeszcze żadnego testu.')();
        cell.classList.add('secondary');
        tr.insertCell().classList.add('wide-screen-only');
        tr.insertCell().classList.add('xlarge-screen-only');
        tr.insertCell();
        tr.insertCell().classList.add('wide-screen-only');
        tr.insertCell().classList.add('xlarge-screen-only');
        tr.insertCell().classList.add('not-xlarge-screen');

        tr = this.ContentWrapper.insertRow();
        tr.insertCell().textContent = 'Wczytywanie...';
        tr.insertCell().classList.add('wide-screen-only');
        tr.insertCell().classList.add('xlarge-screen-only');
        tr.insertCell();
        tr.insertCell().classList.add('wide-screen-only');
        tr.insertCell().classList.add('xlarge-screen-only');
        tr.insertCell().classList.add('not-xlarge-screen');
    }

    Populate(assignments: Assignment[]) {
        (async () => {
            this.Subheading.textContent = 'Tutaj wyświetlane są te testy, dla których wykorzystał' + ((await UserLoader.GetCurrent())?.IsFemale() ? 'a' : 'e') + 'ś wszystkie podejścia, oraz te, których termin rozwiązania minął.';
        })();
        this.GetElement().style.display = '';
        this.ContentWrapper.textContent = '';
        this.RowCount = 0;
        for(let i = assignments.length - 1; i >= 0; i--) {
            if(assignments[i].IsActive()) continue;
            this.ContentWrapper.appendChild(new AssignedTestRow(assignments[i]).GetElement());
            this.RowCount++;
        }
    }
}
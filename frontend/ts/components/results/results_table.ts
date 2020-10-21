import Component from '../basic/component';
import Assignment from '../../entities/assignment';
import { CompareUsersByName } from '../../utils/arrayutils';
import * as DateUtils from '../../utils/dateutils';

export default class ResultsTable extends Component {
    protected Element: HTMLTableElement;
    protected TableBody: HTMLTableSectionElement;

    constructor() {
        super();

        this.Element = document.createElement('table');
        this.Element.classList.add('table', 'full-width');

        let thead = this.Element.createTHead();
        let tr_head = thead.insertRow(-1);
        let ths: HTMLTableHeaderCellElement[] = [];

        for(let i = 0; i < 4; i++) {
            ths.push(document.createElement('th'));
            tr_head.appendChild(ths[i]);
        }

        ths[0].textContent = 'Uczeń';
        ths[1].textContent = 'Wynik';
        ths[2].textContent = 'Podejść';
        ths[3].textContent = 'Ostatnie podejście';

        this.TableBody = this.Element.createTBody();

        let loading_tr = this.TableBody.insertRow(-1);
        let loading_td = loading_tr.insertCell(-1);
        loading_td.colSpan = 4;
        loading_td.classList.add('secondary');
        loading_td.textContent = 'Wczytywanie...';
    }

    public async Populate(assignment: Assignment) {
        let targets_awaiter = assignment.GetTargets();
        let results_awaiter = assignment.GetResults();

        let users = (await targets_awaiter).AllUsers;
        let results = await results_awaiter;
        users.sort(CompareUsersByName);

        this.TableBody.textContent = '';

        for(let user of users) {
            let tr = this.TableBody.insertRow(-1);
            let tds: HTMLTableCellElement[] = [];

            for(let i = 0; i < 4; i++) tds.push(tr.insertCell(-1));

            tds[0].textContent = user.GetFullName();

            let attempt_count_awaiter = assignment.CountUsersAttempts(user);
            let score = await assignment.GetUsersScore(user);
            if(score === undefined) {
                tds[1].textContent = '—';
                tds[1].title = 'Nie pod' + (user.IsFemale() ? 'eszła' : 'szedł');
            } else {
                tds[1].textContent = score.toString() + '%';
            }

            let attempt_count = await attempt_count_awaiter;
            tds[2].textContent = attempt_count.toString();
            if(attempt_count >= assignment.AttemptLimit && !assignment.AreAttemptsUnlimited()) {
                tds[2].classList.add('error');
                if(user.IsFemale())
                    tds[2].title = 'Ta uczennica wykorzystała już wszystkie podejścia.';
                else
                    tds[2].title = 'Ten uczeń wykorzystał już wszystkie podejścia.';
            }

            let last_attempt = results[user.Id].LastAttempt;
            if(last_attempt === undefined) {
                tds[3].textContent = '—';
                tds[3].title = 'Nie pod' + (user.IsFemale() ? 'eszła' : 'szedł');
            } else {
                tds[3].textContent = DateUtils.ToDayHourFormat(last_attempt);
            }

            tds[1].classList.add('center');
            tds[2].classList.add('center');
            tds[3].classList.add('center');
        }
    }
}
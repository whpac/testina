import Component from '../basic/component';
import Assignment from '../../entities/assignment';
import * as DateUtils from '../../utils/dateutils';

export default class AssignmentsTable extends Component{
    protected Element: HTMLTableElement;
    protected TableBody: HTMLTableSectionElement;

    constructor(){
        super();

        this.Element = document.createElement('table');
        this.Element.classList.add('table', 'full-width');

        this.TableBody = this.Element.createTBody();

        let thead_row = this.Element.createTHead().insertRow(-1);
        let ths: HTMLTableHeaderCellElement[] = [];

        for(let i = 0; i < 3; i++){
            ths[i] = document.createElement('th');
            thead_row.appendChild(ths[i]);
        }
        ths[0].textContent = 'Przypisano';
        ths[1].textContent = 'Termin';
        ths[2].textContent = 'Osoby';
    }

    public async Populate(assignments: Assignment[]){
        for(let assignment of assignments){
            let tr = this.TableBody.insertRow(0);
            let cells: HTMLTableDataCellElement[] = [];
            for(let i = 0; i < 3; i++){
                cells[i] = tr.insertCell(-1);
                cells[i].classList.add('center');
            }

            cells[0].textContent = DateUtils.ToDayHourFormat(assignment.AssignmentDate);
            cells[1].textContent = DateUtils.ToDayHourFormat(assignment.Deadline);
            cells[2].textContent = (await assignment.GetTargets()).length.toString();

            if(assignment.Deadline > new Date()){
                cells[1].classList.add('success');
                cells[1].title = 'Termin jeszcze nie upłynął';
            }else{
                cells[1].title = 'Termin upłynął';
            }
        }
    }
}
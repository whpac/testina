import Dialog from '../basic/dialog';
import Test from '../../entities/test';
import * as DateUtils from '../../utils/dateutils';

import { GoToPage, HandleLinkClick } from '../../1page/pagemanager';
import AssignTestDialog from './assigning/assign_test_dialog';
import { n } from '../../utils/textutils';

export default class TestSummaryDialog extends Dialog {
    protected QuestionCountElement: HTMLTableDataCellElement;
    protected QuestionCreationDateElement: HTMLTableDataCellElement;
    protected AssignmentCountRow: HTMLTableRowElement;
    protected AssignmentCountElement: HTMLTableDataCellElement;
    protected CurrentTest: (Test | undefined);

    constructor(){
        super();

        let content_table = document.createElement('table');
        content_table.classList.add('table', 'full-width', 'center');
    
        let row: HTMLTableRowElement[] = [];
        row[0] = content_table.insertRow(-1);
        row[0].appendChild(document.createElement('th'));
        row[0].appendChild(document.createElement('th'));

        row[1] = content_table.insertRow(-1);
        row[1].insertCell(-1).textContent = 'Liczba pytań:';
        this.QuestionCountElement = row[1].insertCell(-1);

        row[2] = content_table.insertRow(-1);
        row[2].insertCell(-1).textContent = 'Utworzono:';
        this.QuestionCreationDateElement = row[2].insertCell(-1);

        this.AssignmentCountRow = content_table.insertRow(-1);
        this.AssignmentCountRow.insertCell(-1).textContent = 'Przypisano:';
        this.AssignmentCountElement = this.AssignmentCountRow.insertCell(-1);
    
        this.AddContent(content_table);

        let close_btn = document.createElement('button');
        close_btn.textContent = 'Zamknij';
        close_btn.addEventListener('click', this.Hide.bind(this));
        this.AddButton(close_btn);

        let edit_btn = document.createElement('button');
        edit_btn.classList.add('secondary');
        edit_btn.textContent = 'Edytuj';
        edit_btn.addEventListener('click', (() => {
            this.Hide();
            GoToPage('testy/edytuj', this.CurrentTest);
        }).bind(this));
        this.AddButton(edit_btn);

        let assign_btn = document.createElement('button');
        assign_btn.classList.add('secondary');
        assign_btn.textContent = 'Przypisz';
        assign_btn.addEventListener('click', (() => {
            this.Hide();
            
            if(this.CurrentTest === undefined) return;
            let assign_dialog = new AssignTestDialog();
            assign_dialog.Populate(this.CurrentTest);
            assign_dialog.Show();
        }).bind(this));
        this.AddButton(assign_btn);
    }

    async Prepare(test: Test){
        this.CurrentTest = test;
        this.SetHeader(await test.GetName());

        this.QuestionCountElement.textContent = 
            (await test.GetQuestionCount()).toString() + 
            ' (×' +  (await test.GetQuestionMultiplier()).toString() + ')';
        this.QuestionCreationDateElement.textContent = DateUtils.ToMediumFormat(await test.GetCreationDate());

        let assignment_count = await test.GetAssignmentCount();
        if(assignment_count === undefined){
            this.AssignmentCountRow.style.display = 'none';
        }else{
            let link = document.createElement('a');
            link.title = 'Kliknij, aby zobaczyć wyniki oraz szczegóły przypisań';
            link.textContent = assignment_count.toString() + ' raz' + n(assignment_count, '', 'y', 'y');
            link.href = 'testy/wyniki/' + test.GetId();
            link.addEventListener('click', (e) => {
                this.Hide();
                HandleLinkClick(e, 'testy/wyniki', test);
            });

            this.AssignmentCountElement.textContent = '';
            this.AssignmentCountElement.appendChild(link);
            this.AssignmentCountRow.style.display = '';
        }
    }
}
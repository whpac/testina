import Dialog from './general/dialog';
import Test from '../entities/test';
import * as DateUtils from '../dateutils';

import { DisplayPage } from '../script';

export default class TestSummaryDialog extends Dialog {
    protected QuestionCountElement: HTMLTableDataCellElement;
    protected QuestionCreationDateElement: HTMLTableDataCellElement;
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
            DisplayPage('testy/edytuj', this.CurrentTest);
        }).bind(this));
        this.AddButton(edit_btn);

        let assign_btn = document.createElement('button');
        assign_btn.classList.add('secondary');
        assign_btn.textContent = 'Przypisz';
        assign_btn.disabled = true;
        assign_btn.addEventListener('click', (() => {
            this.Hide();
            
            if(this.CurrentTest === undefined) return;
            /*AssignTest(this.CurrentTest);*/
        }).bind(this));
        this.AddButton(assign_btn);
    }

    async Prepare(test: Test){
        this.QuestionCountElement.textContent = 
            (await test.GetQuestionCount()).toString() + 
            ' (×' +  (await test.GetQuestionMultiplier()).toString() + ')';
        this.QuestionCreationDateElement.textContent = DateUtils.ToMediumFormat(await test.GetCreationDate());
        this.SetHeader(await test.GetName());
        this.CurrentTest = test;
    }
}
import Dialog from './dialog';
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
        this.AddButton('Zamknij', () => {this.Hide();});
        this.AddButton('Edytuj', () => {this.Hide(); DisplayPage('testy/edytuj', this.CurrentTest)}, ['secondary']);
        this.AddButton('Przypisz', () => {
            this.Hide();
            
            if(this.CurrentTest === undefined) return;
            /*AssignTest(this.CurrentTest);*/
        }, ['secondary']);
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
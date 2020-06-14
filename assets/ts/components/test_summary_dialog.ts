import Dialog from './dialog';

interface TestDescriptor {
    id: number;
    name: string;
    creation_date: string;
    question_count: number;
    question_multiplier: number;
}

export default class TestSummaryDialog extends Dialog {
    protected QuestionCountElement: HTMLTableDataCellElement;
    protected QuestionCreationDateElement: HTMLTableDataCellElement;
    protected CurrentTest: (TestDescriptor | undefined);

    constructor(){
        super();

        let content = document.createElement('table');
        content.classList.add('table', 'full-width', 'center');
    
        let row: HTMLTableRowElement[] = [];
        row[0] = document.createElement('tr');
        row[0].appendChild(document.createElement('th'));
        row[0].appendChild(document.createElement('th'));
        content.appendChild(row[0]);

        row[1] = document.createElement('tr');
        row[1].appendChild(document.createElement('td'));
        row[1].appendChild(this.QuestionCountElement = document.createElement('td'));
        content.appendChild(row[1]);

        row[2] = document.createElement('tr');
        row[2].appendChild(document.createElement('td'));
        row[2].appendChild(this.QuestionCreationDateElement = document.createElement('td'));
        content.appendChild(row[2]);
    
        this.AddContent(content);
        this.AddButton('Zamknij', () => {this.Hide();});
        this.AddButton('Edytuj', () => {window.location.href = 'testy/edytuj/' + (this.CurrentTest?.id.toString() ?? '')}, ['secondary']);
        this.AddButton('Przypisz', () => {
            this.Hide();
            
            if(this.CurrentTest === undefined) return;
            /*AssignTest(this.CurrentTest);*/
        }, ['secondary']);
    }

    Prepare(test: TestDescriptor){
        this.QuestionCountElement.innerText = test.question_count + ' (×' + test.question_multiplier + ')';
        this.QuestionCreationDateElement.innerText = test.creation_date;
        this.SetHeader(test.name);
        this.CurrentTest = test;
    }
}
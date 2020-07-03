import Component from './general/component';
import Test from '../entities/test';
import Question from '../entities/question';
import EditQuestionDialog from './edit_question_dialog';

import * as Toasts from '../toasts';
import { Truncate } from '../functions';

export default class QuestionsTable extends Component {
    ContentWrapperElem: HTMLTableSectionElement;
    EditDialog: EditQuestionDialog;

    constructor(){
        super();

        this.Element = document.createElement('table');
        this.Element.classList.add('table', 'full-width');
        this.Element.innerHTML = 
            '<colgroup>' +
                '<col class="shrink" />' +
                '<col />' +
                '<col class="shrink" />' +
                '<col class="shrink" />' +
                '<col class="shrink" />' +
            '</colgroup>' +
            '<tr>' +
                '<th></th>' +
                '<th>Treść</th>' +
                '<th>Punkty</th>' +
                '<th></th>' +
                '<th></th>' +
            '</tr>';

        this.ContentWrapperElem = (this.Element as HTMLTableElement).createTBody();
        this.ContentWrapperElem.classList.add('content-tbody');
        this.ClearContent();

        let nocontent_tbody = (this.Element as HTMLTableElement).createTBody();
        nocontent_tbody.classList.add('nocontent-tbody');
        nocontent_tbody.innerHTML = 
            '<tr>' +
                '<td></td>' +
                '<td><i class="secondary">Nie ma jeszcze żadnych pytań</i></td>' +
                '<td></td>' +
                '<td></td>' +
                '<td></td>' +
            '</tr>';
        
        let button_footer = (this.Element as HTMLTableElement).createTFoot();
        let tr = button_footer.insertRow(-1);

        let add_button = document.createElement('button');
        add_button.classList.add('compact');
        add_button.textContent = 'Dodaj pytanie';
        add_button.addEventListener('click', this.AddQuestion.bind(this));

        tr.insertCell(-1);
        tr.insertCell(-1).appendChild(add_button);
        tr.insertCell(-1);
        tr.insertCell(-1);
        tr.insertCell(-1);

        this.EditDialog = new EditQuestionDialog();
    }

    ClearContent(message?: string){
        message = message ?? 'Ładowanie...';
        this.ContentWrapperElem.innerHTML = 
            '<tr>' +
                '<td></td>' +
                '<td>' + message + '</td>' +
                '<td></td>' +
                '<td></td>' +
                '<td></td>' +
            '</tr>';
    }

    async LoadQuestions(test: Test){
        let questions: Question[] = [];
        try{
            questions = await test.GetQuestions();
            this.ContentWrapperElem.innerText = '';
        }catch(e){
            this.ClearContent('Nie udało się wczytać pytań: ' + e.toString());
        }
        this.EditDialog.Test = test;

        questions.forEach(this.AppendRow.bind(this));
    }

    async AppendRow(question: Question){
        let tr = this.ContentWrapperElem.insertRow(-1);
        let row_number = this.ContentWrapperElem.rows.length;

        let td_num = tr.insertCell(-1);
        td_num.classList.add('secondary');
        td_num.textContent = row_number.toString() + '.';

        let td_text = tr.insertCell(-1);
        td_text.textContent = Truncate(await question.GetText(), 60);

        let td_pts = tr.insertCell(-1);
        td_pts.classList.add('center');
        td_pts.textContent = (await question.GetPoints()).toLocaleString();

        let td_edit = tr.insertCell(-1);
        let btn_edit = document.createElement('button');
        btn_edit.classList.add('compact');
        btn_edit.textContent = 'Edytuj';
        btn_edit.addEventListener('click', () => this.EditDialog.PopulateAndShow(question).catch(() => {}));
        td_edit.appendChild(btn_edit);

        let td_rem = tr.insertCell(-1);
        let btn_rem = document.createElement('button');
        btn_rem.classList.add('compact', 'error', 'fa', 'fa-trash');
        btn_rem.title = 'Usuń pytanie';
        btn_rem.addEventListener('click', (() => this.RemoveQuestion(question)).bind(this));
        td_rem.appendChild(btn_rem);

        question.AddEventListener('change', async () => {
            td_text.textContent = Truncate(await question.GetText(), 60);
            td_pts.textContent = (await question.GetPoints()).toLocaleString();
        });

        question.AddEventListener('remove', (async () => {
            tr.remove();
            this.UpdateRowNumbers();
        }).bind(this));
    }

    UpdateRowNumbers(){
        let rows = this.ContentWrapperElem.rows;
        for(let i = 0; i < rows.length; i++){
            rows[i].children[0].textContent = (i + 1).toString() + '.';
        }
    }

    AddQuestion(){
        this.EditDialog.PopulateAndShow(undefined).then((question) => {
            this.AppendRow(question);
        }).catch(() => {});
    }

    async RemoveQuestion(question: Question){
        let question_text = Truncate(await question.GetText(), 30);
        let result = window.confirm('Usunięcia pytania nie da się cofnąć.\nCzy usunąć pytanie „' + question_text + '” mimo to?');
        if(!result) return;

        let removing_toast = Toasts.ShowPersistent('Usuwanie pytania „' + question_text + '”...');
        try{
            await question.Remove();
            Toasts.Show('Pytanie „' + question_text + '” zostało usunięte.');
        }catch(e){
            Toasts.Show('Nie udało się usunąć pytania.');
        }finally{
            removing_toast.Hide();
        }
    }
}
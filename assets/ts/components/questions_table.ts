import Component from './component';
import Test from '../entities/test';
import Question from '../entities/question';
import EditQuestionDialog from './edit_question_dialog';

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

        this.ContentWrapperElem = document.createElement('tbody');
        this.ContentWrapperElem.classList.add('content-tbody');
        this.ContentWrapperElem.innerHTML = 
            '<tr>' +
                '<td></td>' +
                '<td>Ładowanie...</td>' +
                '<td></td>' +
                '<td></td>' +
                '<td></td>' +
            '</tr>';
        this.Element.appendChild(this.ContentWrapperElem);

        let nocontent_tbody = document.createElement('tbody');
        nocontent_tbody.classList.add('nocontent-tbody');
        nocontent_tbody.innerHTML = 
            '<tr>' +
                '<td></td>' +
                '<td><i class="secondary">Nie ma jeszcze żadnych pytań</i></td>' +
                '<td></td>' +
                '<td></td>' +
                '<td></td>' +
            '</tr>'
        this.Element.appendChild(nocontent_tbody);

        this.EditDialog = new EditQuestionDialog();
    }

    async LoadQuestions(test: Test){
        let questions = await Question.GetForTest(test);
        this.ContentWrapperElem.innerText = '';

        questions.forEach(async (question, index) => {
            let tr = this.ContentWrapperElem.insertRow(-1);

            let td_num = tr.insertCell(-1);
            td_num.classList.add('secondary');
            td_num.textContent = (index + 1).toString() + '.';

            let td_text = tr.insertCell(-1);
            td_text.textContent = (await question.GetText());

            let td_pts = tr.insertCell(-1);
            td_pts.classList.add('center');
            td_pts.textContent = (await question.GetPoints()).toLocaleString();

            let td_edit = tr.insertCell(-1);
            let btn_edit = document.createElement('button');
            btn_edit.classList.add('compact');
            btn_edit.textContent = 'Edytuj';
            btn_edit.addEventListener('click', () => this.EditDialog.PopulateAndShow(question));
            td_edit.appendChild(btn_edit);

            let td_rem = tr.insertCell(-1);
            let btn_rem = document.createElement('button');
            btn_rem.classList.add('compact', 'error', 'fa', 'fa-trash');
            btn_rem.title = 'Usuń pytanie';
            td_rem.appendChild(btn_rem);
        });
    }
}
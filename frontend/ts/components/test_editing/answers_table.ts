import Component from '../basic/component';
import Answer from '../../entities/answer';
import AnswerRow from './answer_row';
import Question from '../../entities/question';

export default class AnswersTable extends Component {
    ContentWrapper: HTMLTableSectionElement;
    AnswerTableHeader: HTMLTableHeaderCellElement;
    CorrectTableHeader: HTMLTableHeaderCellElement;
    AddAnswerCorrectCell: HTMLTableDataCellElement;

    Question: Question | undefined;
    AnswerRows: AnswerRow[] = [];
    IsOpenAnswer: boolean = false;

    constructor() {
        super();

        this.Element = document.createElement('table');
        this.Element.classList.add('table', 'full-width');

        let colgroup = document.createElement('colgroup');
        let col_shrink = document.createElement('col');
        col_shrink.classList.add('shrink');
        colgroup.appendChild(col_shrink.cloneNode(false));
        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(col_shrink.cloneNode(false));
        colgroup.appendChild(col_shrink.cloneNode(false));
        this.Element.appendChild(colgroup);

        let thead = (this.Element as HTMLTableElement).createTHead();
        let tr_head = thead.insertRow(-1);
        tr_head.appendChild(document.createElement('th'));

        this.AnswerTableHeader = document.createElement('th');
        this.AnswerTableHeader.textContent = 'Odpowiedzi';
        tr_head.appendChild(this.AnswerTableHeader);

        this.CorrectTableHeader = document.createElement('th');
        this.CorrectTableHeader.textContent = 'Poprawna';
        tr_head.appendChild(this.CorrectTableHeader);
        tr_head.appendChild(document.createElement('th'));

        this.ContentWrapper = (this.Element as HTMLTableElement).createTBody();
        this.ContentWrapper.classList.add('content-tbody');
        this.ClearContent();

        let nocontent = (this.Element as HTMLTableElement).createTBody();
        nocontent.classList.add('nocontent-tbody');
        nocontent.innerHTML = `
            <tr>
                <td></td>
                <td><i class="secondary">Nie ma żadnych odpowiedzi</i></td>
                <td></td>
                <td></td>
            </tr>`;

        let tfoot = (this.Element as HTMLTableElement).createTFoot();
        let tr_foot = tfoot.insertRow(-1);

        tr_foot.insertCell(-1);
        let td_add = tr_foot.insertCell(-1);
        this.AddAnswerCorrectCell = tr_foot.insertCell(-1);
        tr_foot.insertCell(-1);

        let btn_add = document.createElement('button');
        btn_add.classList.add('compact');
        btn_add.textContent = 'Dodaj';
        btn_add.addEventListener('click', this.AddAnswer.bind(this));
        td_add.appendChild(btn_add);
    }

    async Populate(question?: Question) {
        this.Question = question;

        if(question === undefined) {
            this.ContentWrapper.innerHTML = '';
            return;
        }

        try {
            let answers = await question.GetAnswers();
            this.ContentWrapper.innerHTML = '';
            answers.forEach((answer) => this.AppendRow(answer));
        } catch(e) {
            let message = '.';
            if('Message' in e) {
                message = ': ' + e.Message;
            }
            this.ClearContent('Nie udało się wczytać odpowiedzi' + message);
        }
    }

    ClearContent(message?: string) {
        message = message ?? 'Wczytywanie...';
        this.AnswerRows = [];
        this.ContentWrapper.innerHTML = `
            <tr>
                <td></td>
                <td>${message}</td>
                <td></td>
                <td></td>
            </tr>`;
    }

    CountPresentRows() {
        let count = 0;
        this.AnswerRows.forEach((row) => {
            if(!row.IsRemoved) count++;
        });
        return count;
    }

    CountCorrectRows() {
        let count = 0;
        this.AnswerRows.forEach((row) => {
            if(row.IsCorrect()) count++;
        });
        return count;
    }

    protected async AppendRow(answer?: Answer) {
        let ar = new AnswerRow(this.AnswerRows.length + 1, answer);
        ar.OnChange = this.UpdateRowNumbers.bind(this);
        ar.SetOpenAnswerMode(this.IsOpenAnswer);
        this.AnswerRows.push(ar);
        this.ContentWrapper.appendChild(ar.GetElement());
        this.UpdateRowNumbers();
    }

    protected UpdateRowNumbers() {
        let row_number = 1;
        this.AnswerRows.forEach((row) => {
            if(row.IsRemoved) {
                row.UpdateRowNumber(0);
            } else {
                row.UpdateRowNumber(row_number);
                row_number++;
            }
        });
    }

    protected AddAnswer() {
        this.AppendRow(undefined);
    }

    public SetOpenAnswerMode(is_open_answer: boolean) {
        this.IsOpenAnswer = is_open_answer;
        if(is_open_answer) {
            this.AnswerTableHeader.textContent = 'Poprawne odpowiedzi';
            this.CorrectTableHeader.style.display = 'none';
            this.AddAnswerCorrectCell.style.display = 'none';
        } else {
            this.AnswerTableHeader.textContent = 'Odpowiedzi';
            this.CorrectTableHeader.style.display = '';
            this.AddAnswerCorrectCell.style.display = '';
        }
        for(let row of this.AnswerRows) {
            row.SetOpenAnswerMode(is_open_answer);
        }
    }

    async Save() {
        if(this.Question === undefined) return;
        let awaiters: Promise<void>[] = [];

        for(let i = 0; i < this.AnswerRows.length; i++) {
            awaiters.push(this.AnswerRows[i].Save(this.Question));
        }

        for(let i = 0; i < awaiters.length; i++) {
            await awaiters[i];
        }
    }
}
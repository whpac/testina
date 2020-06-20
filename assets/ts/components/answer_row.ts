import Component from './component';
import Answer from '../entities/answer';

export default class AnswerRow extends Component {
    protected RowNumberCell: HTMLTableCellElement;
    protected TextInput: HTMLInputElement;
    protected CorrectCheckbox: HTMLInputElement;

    protected Answer: Answer | undefined;

    OnRemove: (() => void) | undefined;

    constructor(row_number: number, answer?: Answer){
        super();

        this.Element = document.createElement('tr');
        this.Answer = answer;

        this.Element.dataset.answerId = this.Answer?.GetId().toString();

        this.RowNumberCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.RowNumberCell.classList.add('secondary');
        this.RowNumberCell.textContent = row_number.toString() + '.';

        let td_text = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.TextInput = document.createElement('input');
        this.TextInput.classList.add('discreet');
        this.TextInput.type = 'text';
        td_text.appendChild(this.TextInput);

        let td_correct = (this.Element as HTMLTableRowElement).insertCell(-1);
        td_correct.classList.add('center');
        this.CorrectCheckbox = document.createElement('input');
        this.CorrectCheckbox.type = 'checkbox';
        td_correct.appendChild(this.CorrectCheckbox);

        let td_rem = (this.Element as HTMLTableRowElement).insertCell(-1);
        let rem_btn = document.createElement('button');
        rem_btn.classList.add('compact', 'error', 'fa', 'fa-trash');
        rem_btn.addEventListener('click', (() => this.RemoveAnswer(this.Element as HTMLTableRowElement)).bind(this));
        rem_btn.title = 'Usuń';
        td_rem.appendChild(rem_btn);

        this.Populate();
    }

    async Populate(){
        this.TextInput.value = (await this.Answer?.GetText()) ?? '';
        this.CorrectCheckbox.checked = (await this.Answer?.IsCorrect()) ?? false;
    }

    protected RemoveAnswer(row: HTMLTableRowElement){
        row.remove();
        this.OnRemove?.();
    }

    UpdateRowNumber(row_number: number){
        this.RowNumberCell.textContent = row_number.toString() + '.';
    }
}
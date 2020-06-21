import Component from './component';
import Answer from '../entities/answer';

export default class AnswerRow extends Component {
    protected RowNumberCell: HTMLTableCellElement;
    protected TextInput: HTMLInputElement;
    protected CorrectCheckbox: HTMLInputElement;
    protected RemoveButton: HTMLButtonElement;
    protected RestoreButton: HTMLButtonElement;

    protected Answer: Answer | undefined;

    public IsRemoved = false;
    OnChange: (() => void) | undefined;

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

        this.RemoveButton = document.createElement('button');
        this.RemoveButton.classList.add('compact', 'error', 'fa', 'fa-trash');
        this.RemoveButton.addEventListener('click', this.RemoveAnswer.bind(this));
        this.RemoveButton.title = 'Usuń';
        td_rem.appendChild(this.RemoveButton);

        this.RestoreButton = document.createElement('button');
        this.RestoreButton.classList.add('compact', 'fa', 'fa-undo');
        this.RestoreButton.style.display = 'none';
        this.RestoreButton.addEventListener('click', this.RestoreAnswer.bind(this));
        this.RestoreButton.title = 'Przywróć';
        td_rem.appendChild(this.RestoreButton);

        this.Populate();
    }

    async Populate(){
        this.TextInput.value = (await this.Answer?.GetText()) ?? '';
        this.CorrectCheckbox.checked = (await this.Answer?.IsCorrect()) ?? false;
    }

    protected RemoveAnswer(){
        this.IsRemoved = true;
        this.TextInput.style.textDecoration = 'line-through';
        this.CorrectCheckbox.style.display = 'none';
        this.RemoveButton.style.display = 'none';
        this.RestoreButton.style.display = '';
        this.OnChange?.();
    }

    protected RestoreAnswer(){
        this.IsRemoved = false;
        this.TextInput.style.textDecoration = '';
        this.CorrectCheckbox.style.display = '';
        this.RemoveButton.style.display = '';
        this.RestoreButton.style.display = 'none';
        this.OnChange?.();
    }

    UpdateRowNumber(row_number: number){
        this.RowNumberCell.textContent = (row_number != 0) ? (row_number.toString() + '.') : '–';
    }
}
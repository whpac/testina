import Component from './general/component';
import Answer from '../entities/answer';
import Question from '../entities/question';

import * as PageManager from '../1page/pagemanager';

export default class AnswerRow extends Component {
    protected RowNumberCell: HTMLTableCellElement;
    protected TextInput: HTMLInputElement;
    protected CorrectCheckbox: HTMLInputElement;
    protected RemoveButton: HTMLButtonElement;
    protected RestoreButton: HTMLButtonElement;

    protected Answer: Answer | undefined;
    protected IgnoreChanges = false;
    protected IsChanged = false;

    public IsRemoved = false;
    OnChange: (() => void) | undefined;

    constructor(row_number: number, answer?: Answer){
        super();

        if(answer === undefined) this.StateChanged(); // answer == undefined if the answer has been just created

        this.Element = document.createElement('tr');
        this.Answer = answer;

        this.RowNumberCell = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.RowNumberCell.classList.add('secondary');
        this.RowNumberCell.textContent = row_number.toString() + '.';

        let td_text = (this.Element as HTMLTableRowElement).insertCell(-1);
        this.TextInput = document.createElement('input');
        this.TextInput.classList.add('discreet');
        this.TextInput.type = 'text';
        this.TextInput.addEventListener('change', this.StateChanged.bind(this));
        td_text.appendChild(this.TextInput);

        let td_correct = (this.Element as HTMLTableRowElement).insertCell(-1);
        td_correct.classList.add('center');
        this.CorrectCheckbox = document.createElement('input');
        this.CorrectCheckbox.type = 'checkbox';
        this.CorrectCheckbox.addEventListener('change', this.StateChanged.bind(this));
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
        this.IgnoreChanges = true;
        this.TextInput.value = (await this.Answer?.GetText()) ?? '';
        this.CorrectCheckbox.checked = (await this.Answer?.IsCorrect()) ?? false;
        this.IgnoreChanges = false;
    }

    IsCorrect(){
        return this.CorrectCheckbox.checked;
    }

    protected StateChanged(){
        if(this.IgnoreChanges) return;
        PageManager.PreventFromNavigation('question-editor');
        this.IsChanged = true;
    }

    protected RemoveAnswer(){
        this.IsRemoved = true;
        this.StateChanged();
        this.TextInput.classList.add('deleted');
        this.CorrectCheckbox.style.display = 'none';
        this.RemoveButton.style.display = 'none';
        this.RestoreButton.style.display = '';
        this.OnChange?.();
    }

    protected RestoreAnswer(){
        this.IsRemoved = false;
        this.StateChanged();
        this.TextInput.classList.remove('deleted');
        this.CorrectCheckbox.style.display = '';
        this.RemoveButton.style.display = '';
        this.RestoreButton.style.display = 'none';
        this.OnChange?.();
    }

    UpdateRowNumber(row_number: number){
        this.RowNumberCell.textContent = (row_number != 0) ? (row_number.toString() + '.') : '–';
    }

    async Save(question: Question){
        if(this.Answer !== undefined){
            if(!this.IsRemoved){
                // Update
                if(this.IsChanged)
                    this.Answer.Update(this.TextInput.value, this.CorrectCheckbox.checked);
            }else{
                // Delete
                this.Answer.Remove();
            }
        }else{
            if(!this.IsRemoved){
                // Create
                Answer.Create(question, this.TextInput.value, this.CorrectCheckbox.checked);
            }
            // Discard
        }
    }
}
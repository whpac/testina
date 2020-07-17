import Dialog from '../../basic/dialog';
import Test from '../../../entities/test';
import TargetsTable from './targets_table';

export default class AssignTestDialog extends Dialog {
    Test: Test | undefined;
    TargetsTable: TargetsTable;

    constructor(){
        super();

        this.DialogElement.classList.add('rich');

        let section_targets = document.createElement('section');
        this.AddContent(section_targets);

        let targets_description = document.createElement('p');
        targets_description.classList.add('secondary');
        targets_description.textContent = 'Wybierz osoby lub grupy, którym test ma zostać przypisany.';
        section_targets.appendChild(targets_description);
        
        this.TargetsTable = new TargetsTable();
        section_targets.appendChild(this.TargetsTable.GetElement());

        let btn_next = document.createElement('button');
        btn_next.textContent = 'Dalej';
        this.AddButton(btn_next);

        let btn_cancel = document.createElement('button');
        btn_cancel.textContent = 'Anuluj';
        btn_cancel.classList.add('secondary');
        btn_cancel.addEventListener('click', this.CancelChanges.bind(this));
        this.AddButton(btn_cancel);
    }

    async Populate(test: Test){
        this.Test = test;
        this.TargetsTable.Populate();

        this.SetHeader('Przypisz: ' + await test.GetName());
    }

    protected CancelChanges(){
        this.Hide();
    }
}
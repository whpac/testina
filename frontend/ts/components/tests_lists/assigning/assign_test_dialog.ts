import Dialog from '../../basic/dialog';
import Test from '../../../entities/test';
import User from '../../../entities/user';
import UsersTable from './users_table';

export default class AssignTestDialog extends Dialog {
    Test: Test | undefined;
    UsersTable: UsersTable;

    constructor(){
        super();

        this.DialogElement.classList.add('rich');

        let section_targets = document.createElement('section');
        this.AddContent(section_targets);

        let targets_description = document.createElement('p');
        targets_description.classList.add('secondary');
        targets_description.textContent = 'Wybierz osoby lub grupy, którym test ma zostać przypisany.';
        section_targets.appendChild(targets_description);
        
        this.UsersTable = new UsersTable();
        section_targets.appendChild(this.UsersTable.GetElement());

        let btn_cancel = document.createElement('button');
        btn_cancel.textContent = 'Anuluj';
        btn_cancel.classList.add('secondary');
        btn_cancel.addEventListener('click', this.CancelChanges.bind(this));
        this.AddButton(btn_cancel);
    }

    async Populate(test: Test){
        this.Test = test;
        this.UsersTable.Populate();

        this.SetHeader('Przypisz: ' + await test.GetName());
    }

    protected CancelChanges(){
        this.Hide();
    }
}
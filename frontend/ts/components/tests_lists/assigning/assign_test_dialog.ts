import Dialog from '../../basic/dialog';
import Test from '../../../entities/test';
import TargetsWrapper from './targets_wrapper';

export default class AssignTestDialog extends Dialog {
    Test: Test | undefined;
    TargetsWrapper: TargetsWrapper;

    constructor(){
        super();

        this.DialogElement.classList.add('rich');

        this.TargetsWrapper = new TargetsWrapper();
        this.AddContent(this.TargetsWrapper.GetElement());

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
        this.TargetsWrapper.Populate();

        this.SetHeader('Przypisz: ' + await test.GetName());
    }

    protected CancelChanges(){
        this.Hide();
    }
}
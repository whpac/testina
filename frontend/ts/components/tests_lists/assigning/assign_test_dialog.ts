import Dialog from '../../basic/dialog';
import Test from '../../../entities/test';
import TargetsWrapper from './targets_wrapper';
import SettingsWrapper from './settings_wrapper';
import NavigationPrevention from '../../../1page/navigationprevention';

export default class AssignTestDialog extends Dialog {
    Test: Test | undefined;
    TargetsWrapper: TargetsWrapper;
    SettingsWrapper: SettingsWrapper;

    constructor(){
        super();

        this.DialogElement.classList.add('rich');

        this.TargetsWrapper = new TargetsWrapper();
        this.AddContent(this.TargetsWrapper.GetElement());

        this.SettingsWrapper = new SettingsWrapper();
        this.AddContent(this.SettingsWrapper.GetElement());

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
        this.SettingsWrapper.Clear();

        this.SetHeader('Przypisz: ' + await test.GetName());
    }

    protected CancelChanges(){
        if(NavigationPrevention.IsPreventedBy('assign-test-dialog')){
            let result = window.confirm('Czy na pewno chcesz przerwać przypisywanie testu?\nSpowoduje to odrzucenie wszystkich zmian dokonanych w tym okienku.');
            if(!result) return;
        }
        NavigationPrevention.Unprevent('assign-test-dialog');
        this.Hide();
    }
}
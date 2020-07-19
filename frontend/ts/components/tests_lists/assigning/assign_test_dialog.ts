import Dialog from '../../basic/dialog';
import Test from '../../../entities/test';
import TargetsWrapper from './targets_wrapper';
import SettingsWrapper from './settings_wrapper';
import NavigationPrevention from '../../../1page/navigationprevention';

export default class AssignTestDialog extends Dialog {
    Test: Test | undefined;
    TargetsWrapper: TargetsWrapper;
    SettingsWrapper: SettingsWrapper;
    PrevButton: HTMLButtonElement;
    NextButton: HTMLButtonElement;
    SaveButton: HTMLButtonElement;

    constructor(){
        super();

        this.DialogElement.classList.add('rich');

        this.TargetsWrapper = new TargetsWrapper();
        this.AddContent(this.TargetsWrapper.GetElement());

        this.SettingsWrapper = new SettingsWrapper();
        this.AddContent(this.SettingsWrapper.GetElement());

        this.SaveButton = document.createElement('button');
        this.SaveButton.textContent = 'Zapisz';
        this.AddButton(this.SaveButton);

        this.NextButton = document.createElement('button');
        this.NextButton.textContent = 'Dalej';
        this.NextButton.addEventListener('click', this.OnNextButtonClick.bind(this));
        this.AddButton(this.NextButton);

        this.PrevButton = document.createElement('button');
        this.PrevButton.textContent = 'Wróć';
        this.PrevButton.classList.add('secondary');
        this.PrevButton.addEventListener('click', this.OnPrevButtonClick.bind(this));
        this.AddButton(this.PrevButton);

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

        this.PrevButton.style.display = 'none';
        this.NextButton.style.display = '';
        this.SaveButton.style.display = 'none';

        this.TargetsWrapper.GetElement().style.display = '';
        this.SettingsWrapper.GetElement().style.display = 'none';

        this.SetHeader('Przypisz: ' + await test.GetName());
    }

    protected OnNextButtonClick(){
        this.PrevButton.style.display = '';
        this.NextButton.style.display = 'none';
        this.SaveButton.style.display = '';

        this.TargetsWrapper.GetElement().style.display = 'none';
        this.SettingsWrapper.GetElement().style.display = '';
    }

    protected OnPrevButtonClick(){
        this.PrevButton.style.display = 'none';
        this.NextButton.style.display = '';
        this.SaveButton.style.display = 'none';

        this.TargetsWrapper.GetElement().style.display = '';
        this.SettingsWrapper.GetElement().style.display = 'none';
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
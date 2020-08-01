import Dialog from '../../basic/dialog';
import Test from '../../../entities/test';
import TargetsWrapper from './targets_wrapper';
import SettingsWrapper from './settings_wrapper';
import NavigationPrevention from '../../../1page/navigationprevention';
import Assignment from '../../../entities/assignment';
import Toast from '../../basic/toast';

export default class AssignTestDialog extends Dialog {
    protected Test: Test | undefined;
    protected TargetsWrapper: TargetsWrapper;
    protected SettingsWrapper: SettingsWrapper;
    protected PrevButton: HTMLButtonElement;
    protected NextButton: HTMLButtonElement;
    protected SaveButton: HTMLButtonElement;

    constructor(){
        super();

        this.DialogElement.classList.add('rich');

        this.TargetsWrapper = new TargetsWrapper();
        this.TargetsWrapper.AddEventListener('validationchanged', this.OnValidationChanged.bind(this));
        this.AddContent(this.TargetsWrapper.GetElement());

        this.SettingsWrapper = new SettingsWrapper();
        this.SettingsWrapper.AddEventListener('validationchanged', this.OnValidationChanged.bind(this));
        this.AddContent(this.SettingsWrapper.GetElement());

        this.SaveButton = document.createElement('button');
        this.SaveButton.textContent = 'Zapisz';
        this.SaveButton.addEventListener('click', this.OnSaveButtonClick.bind(this));
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

        this.SetHeader('Przypisz: ' + test.Name);
    }

    protected OnNextButtonClick(){
        if(!this.TargetsWrapper.IsValid) return;

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

    protected async OnSaveButtonClick(){
        if(!this.SettingsWrapper.IsValid) return;
        if(this.Test === undefined) return;

        NavigationPrevention.Unprevent('assign-test-dialog');

        let targets = this.TargetsWrapper.GetSelectedTargets();
        let attempt_limit = this.SettingsWrapper.GetAttemptLimit();
        let deadline = this.SettingsWrapper.GetDeadline();

        let assigning_toast = new Toast('Przypisywanie testu „' + this.Test.Name + '”...');
        try{
            assigning_toast.Show();
            let assignment = await Assignment.Create(this.Test, attempt_limit, deadline);
            await assignment.AddTargets(targets);
            this.Hide();
            new Toast('Test „' + this.Test.Name + '” został przypisany.').Show(0);
        }catch(e){
            new Toast('Nie udało się przypisać testu').Show(0);
        }finally{
            assigning_toast.Hide();
        }
    }

    protected OnValidationChanged(){
        this.NextButton.disabled = !this.TargetsWrapper.IsValid;
        this.SaveButton.disabled = !this.SettingsWrapper.IsValid;
    }
}
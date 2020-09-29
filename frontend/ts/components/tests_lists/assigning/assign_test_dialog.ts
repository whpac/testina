import Dialog from '../../basic/dialog';
import Test from '../../../entities/test';
import TargetsWrapper from './targets_wrapper';
import SettingsWrapper from './settings_wrapper';
import NavigationPrevention from '../../../1page/navigation_prevention';
import Assignment, { AssignmentTargets } from '../../../entities/assignment';
import Toast from '../../basic/toast';

export default class AssignTestDialog extends Dialog {
    protected Test: Test | undefined;
    protected ExistingAssignment: Assignment | undefined;
    protected TargetsWrapper: TargetsWrapper;
    protected SettingsWrapper: SettingsWrapper;
    protected PrevButton: HTMLButtonElement;
    protected NextButton: HTMLButtonElement;
    protected SaveButton: HTMLButtonElement;

    constructor() {
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

    /**
     * Wypełnia okienko dialogowe
     * @param test Test, dla którego jest przypisanie
     * @param preselected_targets Cele do zaznaczenia
     * @param existing_assignment Istniejące przypisanie do edycji
     */
    async Populate(test: Test, preselected_targets?: AssignmentTargets, existing_assignment?: Assignment) {
        this.Test = test;
        this.ExistingAssignment = existing_assignment;
        this.TargetsWrapper.Populate(preselected_targets);
        this.SettingsWrapper.Clear();

        this.PrevButton.style.display = 'none';
        this.NextButton.style.display = '';
        this.SaveButton.style.display = 'none';

        this.TargetsWrapper.GetElement().style.display = '';
        this.SettingsWrapper.GetElement().style.display = 'none';

        if(existing_assignment === undefined) {
            if(test.Type == Test.TYPE_SURVEY) this.SetHeader('Udostępnij: ' + test.Name);
            else this.SetHeader('Przypisz: ' + test.Name);
        } else {
            if(test.Type == Test.TYPE_SURVEY) this.SetHeader('Udostępnij: ' + test.Name);
            else this.SetHeader('Edytuj przypisanie: ' + test.Name);
            this.SettingsWrapper.SetAttemptLimit(existing_assignment.AttemptLimit);
            this.SettingsWrapper.SetDeadline(existing_assignment.Deadline);
        }

        this.TargetsWrapper.DisplayAppropriateTargetsDescription(test.Type);
        this.SettingsWrapper.DisplayAppropriateSettingsDescription(test.Type);
    }

    protected OnNextButtonClick() {
        if(!this.TargetsWrapper.IsValid) return;

        this.PrevButton.style.display = '';
        this.NextButton.style.display = 'none';
        this.SaveButton.style.display = '';

        this.TargetsWrapper.GetElement().style.display = 'none';
        this.SettingsWrapper.GetElement().style.display = '';
    }

    protected OnPrevButtonClick() {
        this.PrevButton.style.display = 'none';
        this.NextButton.style.display = '';
        this.SaveButton.style.display = 'none';

        this.TargetsWrapper.GetElement().style.display = '';
        this.SettingsWrapper.GetElement().style.display = 'none';
    }

    protected CancelChanges() {
        if(NavigationPrevention.IsPreventedBy('assign-test-dialog')) {
            let result = window.confirm('Czy na pewno chcesz przerwać przypisywanie testu?\nSpowoduje to odrzucenie wszystkich zmian dokonanych w tym okienku.');
            if(!result) return;
        }
        NavigationPrevention.Unprevent('assign-test-dialog');
        this.Hide();
    }

    protected async OnSaveButtonClick() {
        if(!this.SettingsWrapper.IsValid) return;
        if(this.Test === undefined) return;

        NavigationPrevention.Unprevent('assign-test-dialog');

        let selected_targets = this.TargetsWrapper.GetSelectedTargets();
        let deselected_targets = this.TargetsWrapper.GetDeselectedTargets();
        let attempt_limit = this.SettingsWrapper.GetAttemptLimit();
        let deadline = this.SettingsWrapper.GetDeadline();

        let test_words = ['Przypisywanie', 'przypisać', 'testu'];
        if(this.Test.Type == Test.TYPE_SURVEY) test_words = ['Udostępnianie', 'udostępnić', 'ankiety'];

        let assigning_toast = new Toast(test_words[0] + ' ' + test_words[2] + ' „' + this.Test.Name + '”...');
        try {
            assigning_toast.Show();
            let assignment;
            if(this.ExistingAssignment === undefined) {
                assignment = await Assignment.Create(this.Test, attempt_limit, deadline);
            } else {
                assignment = this.ExistingAssignment;
                await assignment.Update(attempt_limit, deadline);
            }
            await assignment.RemoveTargets(deselected_targets, false);
            await assignment.AddTargets(selected_targets);
            this.Hide();

            let test_words = ['Test', '', 'przypisany'];
            if(this.Test.Type == Test.TYPE_SURVEY) test_words = ['Ankieta', 'a', 'udostępniona'];

            new Toast(test_words[0] + ' „' + this.Test.Name + '” został' + test_words[1] + ' ' + test_words[2] + '.').Show(0);
        } catch(e) {
            let message = '.';
            if('Message' in e) {
                message = ': ' + e.Message;
            }
            new Toast('Nie udało się ' + test_words[0] + ' ' + test_words[1] + message).Show(0);
        } finally {
            assigning_toast.Hide();
        }
    }

    protected OnValidationChanged() {
        this.NextButton.disabled = !this.TargetsWrapper.IsValid;
        this.SaveButton.disabled = !this.SettingsWrapper.IsValid;
    }
}
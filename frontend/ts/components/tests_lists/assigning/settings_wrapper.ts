import Component from '../../basic/component';
import NavigationPrevention from '../../../1page/navigation_prevention';
import DateTimeInput from '../../basic/compat/datetimeinput';
import HelpLink from '../../help_link';
import Test from '../../../entities/test';

export default class SettingsWrapper extends Component<'validationchanged'> {
    protected SettingsDescription: HTMLParagraphElement;
    protected DeadlineInput: DateTimeInput;
    protected ShortDeadlineWarning: HTMLParagraphElement;
    protected DeadlineInPastError: HTMLParagraphElement;
    protected AttemptLimitFieldset: HTMLElement;
    protected AttemptLimitDesciption: Text;
    protected AttemptsUnlimitedRadio: HTMLInputElement;
    protected AttemptsLimitedRadio: HTMLInputElement;
    protected AttemptsLimitedLabel: HTMLLabelElement;
    protected AttemptsLimitedCountInput: HTMLInputElement;
    protected WrongAttemptLimitError: HTMLParagraphElement;

    public IsValid: boolean = true;

    constructor() {
        super();

        this.Element = document.createElement('section');
        this.Element.classList.add('no-margin');

        this.SettingsDescription = document.createElement('p');
        this.SettingsDescription.classList.add('secondary');
        this.AppendChild(this.SettingsDescription);

        let deadline_label = document.createElement('label');
        deadline_label.textContent = 'Termin: ';
        deadline_label.htmlFor = 'deadline-input';
        this.AppendChild(deadline_label);

        this.DeadlineInput = new DateTimeInput();
        this.DeadlineInput.AddEventListener('change', this.StateChanged.bind(this));
        let deadline_input = this.DeadlineInput.GetElement();
        deadline_input.classList.add('narrow');
        deadline_input.id = deadline_label.htmlFor;
        this.AppendChild(deadline_input);

        this.ShortDeadlineWarning = document.createElement('p');
        this.ShortDeadlineWarning.classList.add('warning-message', 'specific');
        this.ShortDeadlineWarning.appendChild(new HelpLink('czas_moze_byc_za_krotki').GetElement());
        this.AppendChild(this.ShortDeadlineWarning);

        this.DeadlineInPastError = document.createElement('p');
        this.DeadlineInPastError.classList.add('error-message', 'specific');
        this.DeadlineInPastError.textContent = 'Podany termin już upłynął.';
        this.AppendChild(this.DeadlineInPastError);

        // Pola dotyczące limitu liczby podejść
        this.AttemptLimitFieldset = document.createElement('div');
        this.AttemptLimitFieldset.classList.add('fieldset');
        this.AttemptLimitFieldset.appendChild(this.AttemptLimitDesciption = document.createTextNode(''));
        this.AttemptLimitFieldset.appendChild(document.createElement('br'));
        this.AppendChild(this.AttemptLimitFieldset);

        // Bez limitu - pole i etykieta
        this.AttemptsUnlimitedRadio = document.createElement('input');
        this.AttemptsUnlimitedRadio.type = 'radio';
        this.AttemptsUnlimitedRadio.name = 'attempts-limit';
        this.AttemptsUnlimitedRadio.id = 'attempts-unlimited';
        this.AttemptsUnlimitedRadio.addEventListener('change', this.UpdateAttemptCountEnableState.bind(this));
        this.AttemptLimitFieldset.appendChild(this.AttemptsUnlimitedRadio);

        let attempts_unlimited_label = document.createElement('label');
        attempts_unlimited_label.htmlFor = this.AttemptsUnlimitedRadio.id;
        attempts_unlimited_label.textContent = 'Bez ograniczeń';
        this.AttemptLimitFieldset.appendChild(attempts_unlimited_label);
        this.AttemptLimitFieldset.appendChild(document.createElement('br'));

        // Limituj podejścia - pole, etykieta i pole
        this.AttemptsLimitedRadio = document.createElement('input');
        this.AttemptsLimitedRadio.type = 'radio';
        this.AttemptsLimitedRadio.name = 'attempts-limit';
        this.AttemptsLimitedRadio.addEventListener('change', this.UpdateAttemptCountEnableState.bind(this));
        this.AttemptLimitFieldset.appendChild(this.AttemptsLimitedRadio);

        this.AttemptsLimitedLabel = document.createElement('label');
        this.AttemptsLimitedLabel.htmlFor = 'attempts-limit-input';
        this.AttemptLimitFieldset.appendChild(this.AttemptsLimitedLabel);

        this.AttemptsLimitedCountInput = document.createElement('input');
        this.AttemptsLimitedCountInput.type = 'number';
        this.AttemptsLimitedCountInput.id = this.AttemptsLimitedLabel.htmlFor;
        this.AttemptsLimitedCountInput.step = '1';
        this.AttemptsLimitedCountInput.min = '1';
        this.AttemptsLimitedCountInput.addEventListener('change', this.StateChanged.bind(this));
        this.AttemptLimitFieldset.appendChild(this.AttemptsLimitedCountInput);

        this.WrongAttemptLimitError = document.createElement('p');
        this.WrongAttemptLimitError.classList.add('error-message', 'specific');
        this.AppendChild(this.WrongAttemptLimitError);

        this.DisplayAppropriateSettingsDescription(Test.TYPE_TEST);
    }

    Clear() {
        this.DeadlineInput.SetValue(new Date());
        this.AttemptsLimitedRadio.checked = true;
        this.AttemptsLimitedCountInput.value = '1';
        this.Validate();
    }

    SetAttemptLimit(limit: number) {
        this.AttemptsLimitedCountInput.value = (limit > 0) ? limit.toString() : '1';
        this.AttemptsLimitedCountInput.disabled = (limit == 0);
        this.AttemptsLimitedRadio.checked = (limit > 0);
        this.AttemptsUnlimitedRadio.checked = (limit == 0);
        this.Validate();
    }

    GetAttemptLimit() {
        let limit = Number.POSITIVE_INFINITY;
        if(this.AttemptsLimitedRadio.checked) limit = parseInt(this.AttemptsLimitedCountInput.value);
        return limit;
    }

    SetDeadline(deadline: Date) {
        this.DeadlineInput.SetValue(deadline);
        this.Validate();
    }

    GetDeadline() {
        return new Date(this.DeadlineInput.GetValue());
    }

    public DisplayAppropriateSettingsDescription(test_type: number) {
        switch(test_type) {
            case Test.TYPE_SURVEY:
                this.SettingsDescription.textContent = 'Ustaw termin na wypełnienie ankiety oraz dopuszczalną ilość wypełnień przez jedną osobę.';
                this.ShortDeadlineWarning.textContent = 'Termin na wypełnienie ankiety może być za krótki.';
                this.AttemptLimitDesciption.textContent = 'Maksymalna liczba wypełnień:';
                this.AttemptsLimitedLabel.textContent = 'Maksymalnie tyle wypełnień: ';
                this.WrongAttemptLimitError.textContent = 'Limit ilości wypełnień musi być liczbą całkowitą większą od zera.';
                break;
            default:
                this.SettingsDescription.textContent = 'Ustaw termin na rozwiązanie testu oraz limit podejść.';
                this.ShortDeadlineWarning.textContent = 'Termin na rozwiązanie testu może być za krótki.';
                this.AttemptLimitDesciption.textContent = 'Maksymalna liczba podejść:';
                this.AttemptsLimitedLabel.textContent = 'Maksymalnie tyle podejść: ';
                this.WrongAttemptLimitError.textContent = 'Limit ilości podejść musi być liczbą całkowitą większą od zera.';
                break;
        }
    }

    protected UpdateAttemptCountEnableState() {
        this.AttemptsLimitedCountInput.disabled = !this.AttemptsLimitedRadio.checked;
        this.StateChanged();
    }

    protected StateChanged() {
        this.Validate();
        NavigationPrevention.Prevent('assign-test-dialog');
    }

    protected Validate() {
        let old_validity = this.IsValid;
        this.IsValid = true;

        let deadline = new Date(this.DeadlineInput.GetValue());

        let time_difference = deadline.getTime() - new Date().getTime();
        let is_too_short = time_difference < 86400000; // Termin wypadający mniej niż dobę naprzód jest określany jako potencjalnie za krótki

        this.ShortDeadlineWarning.style.display = (is_too_short && time_difference > 0) ? '' : 'none';
        this.DeadlineInPastError.style.display = (time_difference <= 0) ? '' : 'none';
        if(time_difference <= 0) this.IsValid = false;

        if(this.AttemptsLimitedRadio.checked) {
            let max_attempts = parseInt(this.AttemptsLimitedCountInput.value);
            let is_wrong_attempt_limit = (max_attempts <= 0 || isNaN(max_attempts));

            this.WrongAttemptLimitError.style.display = is_wrong_attempt_limit ? '' : 'none';
            if(is_wrong_attempt_limit) this.IsValid = false;
        } else {
            this.WrongAttemptLimitError.style.display = 'none';
        }

        if(old_validity != this.IsValid) this.FireEvent('validationchanged');
    }
}
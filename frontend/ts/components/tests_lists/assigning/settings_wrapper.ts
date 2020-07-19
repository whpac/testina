import Component from '../../basic/component';
import NavigationPrevention from '../../../1page/navigationprevention';

export default class SettingsWrapper extends Component {
    protected AttemptLimitFieldset: HTMLElement;
    protected AttemptsUnlimitedRadio: HTMLInputElement;
    protected AttemptsLimitedRadio: HTMLInputElement;
    protected AttemptsLimitedCountInput: HTMLInputElement;

    constructor(){
        super();

        let description = document.createElement('p');
        description.classList.add('secondary');
        description.textContent = 'Ustaw termin na rozwiązanie testu oraz limit podejść';
        this.AppendChild(description);

        let form = document.createElement('div');
        form.classList.add('grid-form');
        this.AppendChild(form);

        let deadline_label = document.createElement('label');
        deadline_label.textContent = 'Termin na rozwiązanie: ';
        deadline_label.htmlFor = 'deadline-input';
        form.appendChild(deadline_label);
        
        let deadline_input = document.createElement('input');
        deadline_input.type = 'datetime-local';
        deadline_input.id = deadline_label.htmlFor;
        deadline_input.classList.add('narrow');
        form.appendChild(deadline_input);

        // Pola dotyczące limitu liczby podejść
        this.AttemptLimitFieldset = document.createElement('div');
        this.AttemptLimitFieldset.classList.add('fieldset');
        this.AttemptLimitFieldset.appendChild(document.createTextNode('Maksymalna liczba podejść:'));
        this.AttemptLimitFieldset.appendChild(document.createElement('br'));
        form.appendChild(this.AttemptLimitFieldset);

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

        let attempts_limited_label = document.createElement('label');
        attempts_limited_label.htmlFor = 'attempts-limit-input';
        attempts_limited_label.textContent = 'Maksymalnie tyle podejść: ';
        this.AttemptLimitFieldset.appendChild(attempts_limited_label);

        this.AttemptsLimitedCountInput = document.createElement('input');
        this.AttemptsLimitedCountInput.type = 'number';
        this.AttemptsLimitedCountInput.id = attempts_limited_label.htmlFor;
        this.AttemptsLimitedCountInput.step = '1';
        this.AttemptsLimitedCountInput.min = '1';
        this.AttemptsLimitedCountInput.addEventListener('change', this.StateChanged.bind(this));
        this.AttemptLimitFieldset.appendChild(this.AttemptsLimitedCountInput);
    }

    Clear(){
        this.AttemptsLimitedRadio.checked = true;
        this.AttemptsLimitedCountInput.value = '1';
    }

    protected UpdateAttemptCountEnableState(){
        this.AttemptsLimitedCountInput.disabled = !this.AttemptsLimitedRadio.checked;
        this.StateChanged();
    }

    protected StateChanged(){
        NavigationPrevention.Prevent('assign-test-dialog');
    }
}
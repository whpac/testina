import * as PageManager from '../../1page/page_manager';

import Test from '../../entities/test';
import Card from '../basic/card';
import Toast from '../basic/toast';
import NavigationPrevention from '../../1page/navigation_prevention';
import TestSaver from '../../entities/savers/testsaver';
import HelpLink from '../help_link';

export default class TestSettings extends Card {
    protected QuestionMultiplierInput: HTMLInputElement;
    protected TestNameInput: HTMLInputElement;

    protected NoTimeLimitRadio: HTMLInputElement;
    protected TimeLimitPresentRadio: HTMLInputElement;
    protected TimeLimitInput: HTMLInputElement;

    protected ScoreCountingSelect: HTMLSelectElement;
    protected ErrorWrapper: HTMLElement;

    protected Test: Test | undefined;
    protected IgnoreChange: boolean = false;

    constructor() {
        super();

        this.GetContentElement().classList.add('grid-form');

        let header = document.createElement('h2');
        header.textContent = 'Ustawienia testu';
        this.AppendChild(header);

        // Pole tekstowe z nazwą testu oraz etykieta
        let test_name_label = document.createElement('label');
        test_name_label.htmlFor = 'test-name-input';
        test_name_label.textContent = 'Nazwa:';
        this.AppendChild(test_name_label);

        this.TestNameInput = document.createElement('input');
        this.TestNameInput.id = 'test-name-input';
        this.TestNameInput.autocomplete = 'off';
        this.TestNameInput.type = 'text';
        this.TestNameInput.classList.add('narrow');
        this.AppendChild(this.TestNameInput);

        // Etykieta do pola z mnożnikiem pytań
        let question_multiplier_label = document.createElement('label');
        question_multiplier_label.htmlFor = 'question-multiplier-input';
        question_multiplier_label.textContent = 'Mnożnik pytań:';
        this.AppendChild(question_multiplier_label);

        // Pole z mnożnikiem pytań, ale włożone w element <span>, bo obok ma być link do pomocy
        let question_multiplier_input_span = document.createElement('span');
        this.QuestionMultiplierInput = document.createElement('input');
        this.QuestionMultiplierInput.id = 'question-multiplier-input';
        this.QuestionMultiplierInput.type = 'number';
        this.QuestionMultiplierInput.step = 'any';
        this.QuestionMultiplierInput.min = '0';
        this.QuestionMultiplierInput.autocomplete = 'off';
        question_multiplier_input_span.appendChild(this.QuestionMultiplierInput);

        // Link do pomocy
        question_multiplier_input_span.appendChild(new HelpLink('mnoznik_pytan').GetElement());
        this.AppendChild(question_multiplier_input_span);

        // Komentarz do mnożnika pytań
        let question_multiplier_desc = document.createElement('p');
        question_multiplier_desc.classList.add('description', 'secondary');
        question_multiplier_desc.innerHTML =
            'Ta wartość oznacza, ile razy każde pytanie zostanie wyświetlone użytkownikowi. ' +
            'Szczegółowy opis znajduje się w <a href="pomoc#mnoznik_pytan" target="_blank">artykule pomocy</a>.';
        this.AppendChild(question_multiplier_desc);

        // Wybór limitu czasu
        let time_limit_fieldset = document.createElement('div');
        time_limit_fieldset.classList.add('fieldset');
        time_limit_fieldset.textContent = 'Limit czasu na podejście';
        time_limit_fieldset.appendChild(new HelpLink('limit_czasu_na_podejscie').GetElement());
        time_limit_fieldset.appendChild(document.createElement('br'));

        // Pole radio - limit obecny
        this.TimeLimitPresentRadio = document.createElement('input');
        this.TimeLimitPresentRadio.type = 'radio';
        this.TimeLimitPresentRadio.name = 'time-limit';
        time_limit_fieldset.appendChild(this.TimeLimitPresentRadio);

        // Pole tekstowe na limit czasu i etykieta
        this.TimeLimitInput = document.createElement('input');
        this.TimeLimitInput.type = 'number';
        this.TimeLimitInput.id = 'time-limit-input';
        this.TimeLimitInput.min = '1';
        this.TimeLimitInput.autocomplete = 'off';
        time_limit_fieldset.appendChild(this.TimeLimitInput);

        let time_limit_input_label = document.createElement('label');
        time_limit_input_label.htmlFor = 'time-limit-input';
        time_limit_input_label.textContent = ' minut';
        time_limit_fieldset.appendChild(time_limit_input_label);

        time_limit_fieldset.appendChild(document.createElement('br'));

        // Pole radio - brak limitu czasu i etykieta
        this.NoTimeLimitRadio = document.createElement('input');
        this.NoTimeLimitRadio.type = 'radio';
        this.NoTimeLimitRadio.id = 'no-time-limit-radio';
        this.NoTimeLimitRadio.name = 'time-limit';
        time_limit_fieldset.appendChild(this.NoTimeLimitRadio);

        let no_time_limit_radio_label = document.createElement('label');
        no_time_limit_radio_label.htmlFor = 'no-time-limit-radio';
        no_time_limit_radio_label.textContent = 'Brak limitu';
        time_limit_fieldset.appendChild(no_time_limit_radio_label);

        this.AppendChild(time_limit_fieldset);

        let score_counting_label = document.createElement('label');
        score_counting_label.htmlFor = 'score-counting-select';
        score_counting_label.textContent = 'Sposób liczenia punktów:';
        this.AppendChild(score_counting_label);

        this.ScoreCountingSelect = document.createElement('select');
        this.ScoreCountingSelect.id = score_counting_label.htmlFor;
        this.AppendChild(this.ScoreCountingSelect);

        let options = [[Test.SCORE_AVERAGE.toString(), 'Średni wynik z podejść'], [Test.SCORE_BEST.toString(), 'Wynik z najlepszego podejścia']];
        for(let option of options) {
            let option_element = document.createElement('option');
            option_element.value = option[0];
            option_element.textContent = option[1];
            this.ScoreCountingSelect.appendChild(option_element);
        }

        this.ErrorWrapper = document.createElement('p');
        this.ErrorWrapper.classList.add('error-message');
        this.AppendChild(this.ErrorWrapper);

        // Przyłączenie obsługi zdarzeń
        this.TimeLimitPresentRadio.addEventListener('change', this.UpdateTimeLimitInputEnabledState.bind(this));
        this.NoTimeLimitRadio.addEventListener('change', this.UpdateTimeLimitInputEnabledState.bind(this));
        this.TestNameInput.addEventListener('change', this.StateChanged.bind(this));
        this.QuestionMultiplierInput.addEventListener('change', this.StateChanged.bind(this));
        this.TimeLimitInput.addEventListener('change', this.StateChanged.bind(this));
        this.ScoreCountingSelect.addEventListener('change', this.StateChanged.bind(this));

        let btn_save = document.createElement('button');
        btn_save.innerText = 'Zapisz ustawienia';
        btn_save.addEventListener('click', this.SaveTestSettings.bind(this));
        this.AddButton(btn_save);

        let btn_remove = document.createElement('button');
        btn_remove.classList.add('error');
        btn_remove.innerText = 'Usuń test';
        btn_remove.addEventListener('click', this.RemoveTest.bind(this));
        this.AddButton(btn_remove);
    }

    /**
     * Wypełnia pola odpowiednimi danymi
     * @param test Test do wyświetlenia
     */
    async Populate(test: Test) {
        this.IgnoreChange = true;
        this.Test = test;
        this.TestNameInput.value = test.Name;
        this.QuestionMultiplierInput.value = test.QuestionMultiplier.toString();
        this.ScoreCountingSelect.value = test.ScoreCounting.toString();

        if(test.HasTimeLimit()) {
            this.TimeLimitPresentRadio.checked = true;
            this.TimeLimitInput.value = (test.TimeLimit / 60).toString();
        } else {
            this.NoTimeLimitRadio.checked = true;
            this.TimeLimitInput.value = '15';
        }
        this.UpdateTimeLimitInputEnabledState();
        this.IgnoreChange = false;
    }

    /**
     * Śledzi zmiany i blokuje nawigację
     */
    protected StateChanged() {
        if(this.IgnoreChange) return;
        NavigationPrevention.Prevent('test-settings');
    }

    /**
     * Odblokowuje pole z limitem czasu
     */
    protected UpdateTimeLimitInputEnabledState() {
        this.StateChanged();
        this.TimeLimitInput.disabled = !this.TimeLimitPresentRadio.checked;
    }

    /**
     * Usuwa test i przechodzi do biblioteki
     */
    protected async RemoveTest() {
        let result = window.confirm('Usunięcia testu nie da się cofnąć.\nKontynuować?');
        if(!result) return;

        let test_name = (this.Test as Test).Name;

        let removing_toast = new Toast('Usuwanie testu „' + test_name + '”...');
        removing_toast.Show();
        try {
            await (this.Test as Test).Remove();
            new Toast('Test „' + test_name + '” został usunięty.').Show(0);
            PageManager.GoToPage('testy/biblioteka');

        } catch(e) {
            let message = '.';
            if('Message' in e) {
                message = ': ' + e.Message;
            }
            new Toast('Nie udało się usunąć testu „' + test_name + '”' + message).Show(0);
        } finally {
            removing_toast.Hide();
        }
    }

    /**
     * Zapisuje ustawienia
     */
    protected async SaveTestSettings() {
        if(!this.Validate()) return;

        let saving_toast = new Toast('Zapisywanie zmian...');
        saving_toast.Show();

        try {
            let test = this.Test as Test;
            test.Name = this.TestNameInput.value;
            test.QuestionMultiplier = parseFloat(this.QuestionMultiplierInput.value);
            test.TimeLimit = this.TimeLimitPresentRadio.checked ? parseInt(this.TimeLimitInput.value) * 60 : 0;
            test.ScoreCounting = parseInt(this.ScoreCountingSelect.value);
            TestSaver.Update(test);

            new Toast('Zmiany w ustawieniach testu zostały zapisane.').Show(0);
            NavigationPrevention.Unprevent('test-settings');

        } catch(e) {
            let message = '.';
            if('Message' in e) {
                message = ': ' + e.Message;
            }
            new Toast('Nie udało się zapisać zmian w ustawieniach testu' + message).Show(0);
        } finally {
            saving_toast.Hide();
        }
    }

    /**
     * Sprawdza poprawność danych
     */
    protected Validate() {
        let errors = [];

        if(this.TestNameInput.value == '') {
            errors.push('Nazwa testu nie może być pusta.');
            this.TestNameInput.classList.add('error');
        } else {
            this.TestNameInput.classList.remove('error');
        }

        if(parseFloat(this.QuestionMultiplierInput.value) <= 0) {
            errors.push('Mnożnik pytań musi być dodatni.');
            this.QuestionMultiplierInput.classList.add('error');
        } else {
            this.QuestionMultiplierInput.classList.remove('error');
        }

        if(parseFloat(this.TimeLimitInput.value) <= 0 && this.TimeLimitPresentRadio.checked) {
            errors.push('Limit czasu musi być liczbą dodatnią.');
            this.TimeLimitInput.classList.add('error');
        } else {
            this.TimeLimitInput.classList.remove('error');
        }

        let errors_html = '';
        for(let i = 0; i < errors.length; i++) {
            if(i > 0) errors_html += '<br/>';
            errors_html += errors[i];
        }
        this.ErrorWrapper.innerHTML = errors_html;

        return errors.length == 0;
    }
}
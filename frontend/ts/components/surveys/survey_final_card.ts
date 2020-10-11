import NavigationPrevention from '../../1page/navigation_prevention';
import TestSaver from '../../entities/savers/testsaver';
import Test from '../../entities/test';
import { AutoGrow } from '../../utils/elementutils';
import Card from '../basic/card';

export default class SurveyFinalCard extends Card {
    protected HeadingField: HTMLInputElement | HTMLHeadingElement;
    protected ContentField: HTMLElement;
    protected Survey: Test | undefined;

    public constructor(edit_mode: boolean = false) {
        super();

        if(edit_mode) {
            let heading = document.createElement('input');
            heading.type = 'text';
            heading.classList.add('heading', 'discreet');
            heading.placeholder = 'Nagłówek – np. „Dziękujemy za wypełnienie ankiety”';
            heading.addEventListener('change', () => NavigationPrevention.Prevent('survey-editor'));
            this.HeadingField = heading;

            let description = document.createElement('textarea');
            description.classList.add('full-width', 'discreet', 'no-resize');
            description.placeholder = 'Tutaj wpisz tekst, który zostanie wyświetlony po zakończeniu wypełniania ankiety.';
            description.addEventListener('change', () => NavigationPrevention.Prevent('survey-editor'));
            AutoGrow(description);
            this.ContentField = description;
        } else {
            this.HeadingField = document.createElement('h2');
            this.ContentField = document.createElement('p');
        }
        this.AppendChild(this.HeadingField);
        this.AppendChild(this.ContentField);
    }

    public Populate(survey: Test) {
        this.Survey = survey;

        if(this.HeadingField instanceof HTMLInputElement && this.ContentField instanceof HTMLTextAreaElement) {
            this.HeadingField.value = survey.FinalTitle;
            this.ContentField.value = survey.FinalText ?? '';
            this.ContentField.style.height = ((survey.FinalText ?? '').split('\n').length * 1.5).toString() + 'em';
        } else {
            this.HeadingField.textContent = survey.FinalTitle;

            let rows = (survey.FinalText ?? '').split('\n');
            this.ContentField.textContent = '';

            for(let i = 0; i < rows.length; i++) {
                if(i != 0) this.ContentField.appendChild(document.createElement('br'));
                this.ContentField.appendChild(document.createTextNode(rows[i]));
            }
        }
    }

    /**
     * Zapisuje zmiany wprowadzone przez użytkownika
     */
    public async Save() {
        if(this.Survey === undefined) return;
        if(!(this.HeadingField instanceof HTMLInputElement && this.ContentField instanceof HTMLTextAreaElement)) return;

        let old_title = this.Survey.FinalTitle;
        let old_text = this.Survey.FinalText;

        this.Survey.FinalTitle = this.HeadingField.value;
        this.Survey.FinalText = this.ContentField.value;

        // Jeżeli nie zmodyfikowano, nie zapisuj (bo nie ma po co)
        if(this.HeadingField.value == old_title &&
            this.ContentField.value == old_text) return;

        try {
            await TestSaver.Update(this.Survey);
        } catch(e) {
            this.Survey.FinalTitle = old_title;
            this.Survey.FinalText = old_text;

            // Przekazywanie wyjątku dalej, po przywróceniu stanu początkowego
            throw e;
        }
    }
}
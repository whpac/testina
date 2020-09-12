import Card from '../basic/card';
import Test from '../../entities/test';
import { AutoGrow } from '../../utils/elementutils';
import NavigationPrevention from '../../1page/navigation_prevention';
import TestSaver from '../../entities/savers/testsaver';

export default class SurveyIntroduction extends Card {
    protected HeadingField: HTMLInputElement | HTMLHeadingElement;
    protected DescriptionField: HTMLElement;
    protected Survey: Test | undefined;

    public constructor(edit_mode: boolean = false) {
        super();

        if(edit_mode) {
            let heading = document.createElement('input');
            heading.type = 'text';
            heading.classList.add('heading', 'discreet');
            heading.placeholder = 'Podaj nazwę ankiety';
            heading.addEventListener('change', () => NavigationPrevention.Prevent('survey-editor'));
            this.HeadingField = heading;

            let description = document.createElement('textarea');
            description.classList.add('full-width', 'discreet', 'no-resize');
            description.placeholder = 'Tutaj możesz wpisać tekst, który zostanie wyświetlony na początku ankiety (opcjonalnie).';
            description.addEventListener('change', () => NavigationPrevention.Prevent('survey-editor'));
            AutoGrow(description);
            this.DescriptionField = description;
        } else {
            this.HeadingField = document.createElement('h2');
            this.DescriptionField = document.createElement('p');
        }
        this.AppendChild(this.HeadingField);
        this.AppendChild(this.DescriptionField);
    }

    public Populate(survey: Test) {
        this.Survey = survey;

        if(this.HeadingField instanceof HTMLInputElement && this.DescriptionField instanceof HTMLTextAreaElement) {
            this.HeadingField.value = survey.Name;
            this.DescriptionField.value = survey.Description ?? '';
        } else {
            this.HeadingField.textContent = survey.Name;
            this.DescriptionField.textContent = survey.Description;
        }
    }

    /**
     * Zapisuje zmiany wprowadzone przez użytkownika
     */
    public async Save() {
        if(this.Survey === undefined) return;
        if(!(this.HeadingField instanceof HTMLInputElement && this.DescriptionField instanceof HTMLTextAreaElement)) return;

        let old_name = this.Survey.Name;
        let old_description = this.Survey.Description;

        this.Survey.Name = this.HeadingField.value;
        this.Survey.Description = this.DescriptionField.value;

        try {
            await TestSaver.Update(this.Survey);
        } catch(e) {
            this.Survey.Name = old_name;
            this.Survey.Description = old_description;

            // Przekazywanie wyjątku dalej, po przywróceniu stanu początkowego
            throw e;
        }
    }
}
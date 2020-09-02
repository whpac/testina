import Card from '../basic/card';
import Test from '../../entities/test';
import { AutoGrow } from '../../utils/elementutils';

export default class SurveyIntroduction extends Card {
    protected HeadingField: HTMLInputElement | HTMLHeadingElement;
    protected DescriptionField: HTMLElement;

    public constructor(edit_mode: boolean = false) {
        super();

        if(edit_mode) {
            let heading = document.createElement('input');
            heading.type = 'text';
            heading.classList.add('heading', 'discreet');
            heading.placeholder = 'Podaj nazwę ankiety';
            this.HeadingField = heading;

            let description = document.createElement('textarea');
            description.classList.add('full-width', 'discreet', 'no-resize');
            description.placeholder = 'Tutaj możesz wpisać tekst, który zostanie wyświetlony na początku ankiety (opcjonalnie).';
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
        if(this.HeadingField instanceof HTMLInputElement && this.DescriptionField instanceof HTMLTextAreaElement) {
            this.HeadingField.value = survey.Name;
            this.DescriptionField.value = survey.Description ?? '';
        } else {
            this.HeadingField.textContent = survey.Name;
            this.DescriptionField.textContent = survey.Description;
        }
    }
}
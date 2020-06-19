import Dialog from './dialog';
import Question from '../entities/question';
import HelpLink from './help_link';

export default class EditQuestionDialog extends Dialog {
    protected TextTextarea: HTMLTextAreaElement;
    protected TypeSelect: HTMLSelectElement;
    protected PointsInput: HTMLInputElement;

    constructor(){
        super();

        this.AddClasses(['rich']);

        let question_data = document.createElement('div');
        question_data.classList.add('grid-form');

        // Treść pytania - etykieta i pole
        let text_label = document.createElement('label');
        text_label.htmlFor = 'question-text-textarea';
        text_label.textContent = 'Treść:';
        question_data.appendChild(text_label);

        this.TextTextarea = document.createElement('textarea');
        this.TextTextarea.id = text_label.htmlFor;
        this.TextTextarea.rows = 3;
        question_data.appendChild(this.TextTextarea);

        // Rodzaj pytania - etykieta i lista rozwijana
        let type_label = document.createElement('label');
        type_label.htmlFor = 'question-type-select';
        type_label.textContent = 'Rodzaj:';
        question_data.appendChild(type_label);

        this.TypeSelect = document.createElement('select');
        this.TypeSelect.id = type_label.htmlFor;
        question_data.appendChild(this.TypeSelect);

        // Opcje listy rozwijanej
        let type_single_choice_option = document.createElement('option');
        type_single_choice_option.value = '0';
        type_single_choice_option.text = 'Jednokrotnego wyboru';
        this.TypeSelect.add(type_single_choice_option);

        let type_multi_choice_option = document.createElement('option');
        type_multi_choice_option.value = '1';
        type_multi_choice_option.text = 'Wielokrotnego wyboru';
        this.TypeSelect.add(type_multi_choice_option);

        let type_open_answer_option = document.createElement('option');
        type_open_answer_option.value = '2';
        type_open_answer_option.text = 'Otwarte';
        this.TypeSelect.add(type_open_answer_option);

        // Punkty do zdobycia - etykieta i pole
        let points_label = document.createElement('label');
        points_label.htmlFor = 'points-input';
        points_label.textContent = 'Liczba punktów:';
        question_data.appendChild(points_label);

        this.PointsInput = document.createElement('input');
        this.PointsInput.id = points_label.htmlFor;
        this.PointsInput.type = 'number';
        this.PointsInput.min = '0';
        this.PointsInput.step = 'any';
        this.PointsInput.classList.add('narrow');
        question_data.appendChild(this.PointsInput);

        this.AddContent(question_data);

        // Pola dotyczące sposobu liczenia punktów (tylko pyt. wielokrotnej odpowiedzi)
        let points_counting_fieldset = document.createElement('div');
        points_counting_fieldset.classList.add('fieldset');
        points_counting_fieldset.appendChild(document.createTextNode('Sposób liczenia punktów:'));
        points_counting_fieldset.appendChild(new HelpLink().GetElement());
        points_counting_fieldset.appendChild(document.createElement('br'));

        // Zero-jedynkowo - pole i etykieta
        let counting_binary_radio = document.createElement('input');
        counting_binary_radio.type = 'radio';
        counting_binary_radio.name = 'points-counting';
        counting_binary_radio.id = 'points-counting-binary';
        points_counting_fieldset.appendChild(counting_binary_radio);

        let counting_binary_label = document.createElement('label');
        counting_binary_label.htmlFor = counting_binary_radio.id;
        counting_binary_label.textContent = 'Zero-jedynkowo';
        points_counting_fieldset.appendChild(counting_binary_label);
        points_counting_fieldset.appendChild(document.createElement('br'));

        // Liniowo - pole i etykieta
        let counting_linear_radio = document.createElement('input');
        counting_linear_radio.type = 'radio';
        counting_linear_radio.name = 'points-counting';
        counting_linear_radio.id = 'points-counting-linear';
        points_counting_fieldset.appendChild(counting_linear_radio);

        let counting_linear_label = document.createElement('label');
        counting_linear_label.htmlFor = counting_linear_label.id;
        counting_linear_label.textContent = 'Po ułamku za każdą poprawną odpowiedź';
        points_counting_fieldset.appendChild(counting_linear_label);

        this.AddContent(points_counting_fieldset);

        // Pola dotyczące obsługi literówek (tylko pyt. otwarte)
        let typos_fieldset = document.createElement('div');
        typos_fieldset.classList.add('fieldset');
        typos_fieldset.appendChild(document.createTextNode('Literówki:'));
        typos_fieldset.appendChild(document.createElement('br'));

        // Nie toleruj literówek - pole i etykieta
        let typos_disallow_radio = document.createElement('input');
        typos_disallow_radio.type = 'radio';
        typos_disallow_radio.name = 'typos';
        typos_disallow_radio.id = 'typos-disallow';
        typos_fieldset.appendChild(typos_disallow_radio);

        let typos_disallow_label = document.createElement('label');
        typos_disallow_label.htmlFor = typos_disallow_radio.id;
        typos_disallow_label.textContent = 'Nie toleruj';
        typos_fieldset.appendChild(typos_disallow_label);
        typos_fieldset.appendChild(document.createElement('br'));

        // Toleruj określoną ilość literówek - pole, etykieta i pole
        let typos_allow_radio = document.createElement('input');
        typos_allow_radio.type = 'radio';
        typos_allow_radio.name = 'typos';
        typos_fieldset.appendChild(typos_allow_radio);

        let typos_allow_label = document.createElement('label');
        typos_allow_label.htmlFor = 'typos-allow-input';
        typos_allow_label.textContent = 'Toleruj tyle literówek: ';
        typos_fieldset.appendChild(typos_allow_label);

        let typos_allow_input = document.createElement('input');
        typos_allow_input.type = 'number';
        typos_allow_input.id = typos_allow_label.htmlFor;
        typos_allow_input.step = '1';
        typos_allow_input.min = '0';
        typos_fieldset.appendChild(typos_allow_input);

        this.AddContent(typos_fieldset);

        let content_elem = document.createElement('div');
        content_elem.innerHTML = 
            `<hr class="spaced" />
            <table class="table full-width">
                <colgroup>
                    <col class="shrink" />
                    <col />
                    <col class="shrink" />
                    <col class="shrink" />
                </colgroup>
                <tbody>
                    <tr>
                        <th></th>
                        <th>Odpowiedzi</th>
                        <th>Poprawna</th>
                        <th></th>
                    </tr>
                </tbody>
                <tbody class="content-tbody" id="answers-tbody"></tbody>
                <tbody class="nocontent-tbody">
                    <tr>
                        <td></td>
                        <td><i class="secondary">Nie ma żadnych odpowiedzi</i></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
                <tbody>
                    <tr>
                        <td></td>
                        <td>
                            <button class="compact" id="add-answer-button">Dodaj</button>
                        </td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
            <div class="error" id="edit-question-error"></div>`;

        this.AddContent(content_elem);
        this.SetHeader('Edytuj pytanie');
        this.DisplayHelpButton();
        this.AddButton('Zapisz', this.Hide);
        this.AddButton('Anuluj', this.Hide, ['secondary']);
    }

    async PopulateAndShow(question: Question){
        this.TextTextarea.value = await question.GetText();
        this.TypeSelect.value = (await question.GetType()).toString();
        this.PointsInput.value = (await question.GetPoints()).toString();
        this.Show();
    }
}
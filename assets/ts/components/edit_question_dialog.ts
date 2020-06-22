import Dialog from './dialog';
import Question from '../entities/question';
import HelpLink from './help_link';
import AnswersTable from './answers_table';
import Test from '../entities/test';

import * as PageManager from '../1page/pagemanager';
import * as Toasts from '../toasts';

export default class EditQuestionDialog extends Dialog {
    protected TextTextarea: HTMLTextAreaElement;
    protected TypeSelect: HTMLSelectElement;
    protected PointsInput: HTMLInputElement;

    protected CountingFieldset: HTMLElement;
    protected CountingBinaryRadio: HTMLInputElement;
    protected CountingLinearRadio: HTMLInputElement;

    protected TyposFieldset: HTMLElement;
    protected TyposDisallowRadio: HTMLInputElement;
    protected TyposAllowRadio: HTMLInputElement;
    protected TyposAllowCountInput: HTMLInputElement;

    protected AnswersTable: AnswersTable;
    protected ErrorWrapper: HTMLElement;

    protected SaveButton: HTMLButtonElement;
    protected CancelButton: HTMLButtonElement;

    protected IgnoreChanges = false;
    protected IsChanged = false;
    protected Question: Question | undefined;
    public Test: Test | undefined;

    protected PromiseResolve: ((question: Question) => void) | undefined;
    protected PromiseReject: (() => void) | undefined;

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
        this.TextTextarea.addEventListener('change', this.StateChanged.bind(this));
        question_data.appendChild(this.TextTextarea);

        // Rodzaj pytania - etykieta i lista rozwijana
        let type_label = document.createElement('label');
        type_label.htmlFor = 'question-type-select';
        type_label.textContent = 'Rodzaj:';
        question_data.appendChild(type_label);

        this.TypeSelect = document.createElement('select');
        this.TypeSelect.id = type_label.htmlFor;
        this.TypeSelect.addEventListener('change', this.UpdateFieldsetVisibilityBasedOnQuestionType.bind(this));
        question_data.appendChild(this.TypeSelect);

        // Opcje listy rozwijanej
        let type_single_choice_option = document.createElement('option');
        type_single_choice_option.value = Question.TYPE_SINGLE_CHOICE.toString();
        type_single_choice_option.text = 'Jednokrotnego wyboru';
        this.TypeSelect.add(type_single_choice_option);

        let type_multi_choice_option = document.createElement('option');
        type_multi_choice_option.value = Question.TYPE_MULTI_CHOICE.toString();
        type_multi_choice_option.text = 'Wielokrotnego wyboru';
        this.TypeSelect.add(type_multi_choice_option);

        let type_open_answer_option = document.createElement('option');
        type_open_answer_option.value = Question.TYPE_OPEN_ANSWER.toString();
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
        this.PointsInput.addEventListener('change', this.StateChanged.bind(this));
        question_data.appendChild(this.PointsInput);

        this.AddContent(question_data);

        // Pola dotyczące sposobu liczenia punktów (tylko pyt. wielokrotnej odpowiedzi)
        this.CountingFieldset = document.createElement('div');
        this.CountingFieldset.classList.add('fieldset');
        this.CountingFieldset.appendChild(document.createTextNode('Sposób liczenia punktów:'));
        this.CountingFieldset.appendChild(new HelpLink().GetElement());
        this.CountingFieldset.appendChild(document.createElement('br'));

        // Zero-jedynkowo - pole i etykieta
        this.CountingBinaryRadio = document.createElement('input');
        this.CountingBinaryRadio.type = 'radio';
        this.CountingBinaryRadio.name = 'points-counting';
        this.CountingBinaryRadio.id = 'points-counting-binary';
        this.CountingBinaryRadio.addEventListener('change', this.StateChanged.bind(this));
        this.CountingFieldset.appendChild(this.CountingBinaryRadio);

        let counting_binary_label = document.createElement('label');
        counting_binary_label.htmlFor = this.CountingBinaryRadio.id;
        counting_binary_label.textContent = 'Zero-jedynkowo';
        this.CountingFieldset.appendChild(counting_binary_label);
        this.CountingFieldset.appendChild(document.createElement('br'));

        // Liniowo - pole i etykieta
        this.CountingLinearRadio = document.createElement('input');
        this.CountingLinearRadio.type = 'radio';
        this.CountingLinearRadio.name = 'points-counting';
        this.CountingLinearRadio.id = 'points-counting-linear';
        this.CountingLinearRadio.addEventListener('change', this.StateChanged.bind(this));
        this.CountingFieldset.appendChild(this.CountingLinearRadio);

        let counting_linear_label = document.createElement('label');
        counting_linear_label.htmlFor = this.CountingLinearRadio.id;
        counting_linear_label.textContent = 'Po ułamku za każdą poprawną odpowiedź';
        this.CountingFieldset.appendChild(counting_linear_label);

        this.AddContent(this.CountingFieldset);

        // Pola dotyczące obsługi literówek (tylko pyt. otwarte)
        this.TyposFieldset = document.createElement('div');
        this.TyposFieldset.classList.add('fieldset');
        this.TyposFieldset.appendChild(document.createTextNode('Literówki:'));
        this.TyposFieldset.appendChild(document.createElement('br'));

        // Nie toleruj literówek - pole i etykieta
        this.TyposDisallowRadio = document.createElement('input');
        this.TyposDisallowRadio.type = 'radio';
        this.TyposDisallowRadio.name = 'typos';
        this.TyposDisallowRadio.id = 'typos-disallow';
        this.TyposDisallowRadio.addEventListener('change', this.UpdateTyposCountEnableState.bind(this));
        this.TyposFieldset.appendChild(this.TyposDisallowRadio);

        let typos_disallow_label = document.createElement('label');
        typos_disallow_label.htmlFor = this.TyposDisallowRadio.id;
        typos_disallow_label.textContent = 'Nie toleruj';
        this.TyposFieldset.appendChild(typos_disallow_label);
        this.TyposFieldset.appendChild(document.createElement('br'));

        // Toleruj określoną ilość literówek - pole, etykieta i pole
        this.TyposAllowRadio = document.createElement('input');
        this.TyposAllowRadio.type = 'radio';
        this.TyposAllowRadio.name = 'typos';
        this.TyposAllowRadio.addEventListener('change', this.UpdateTyposCountEnableState.bind(this));
        this.TyposFieldset.appendChild(this.TyposAllowRadio);

        let typos_allow_label = document.createElement('label');
        typos_allow_label.htmlFor = 'typos-allow-input';
        typos_allow_label.textContent = 'Toleruj tyle literówek: ';
        this.TyposFieldset.appendChild(typos_allow_label);

        this.TyposAllowCountInput = document.createElement('input');
        this.TyposAllowCountInput.type = 'number';
        this.TyposAllowCountInput.id = typos_allow_label.htmlFor;
        this.TyposAllowCountInput.step = '1';
        this.TyposAllowCountInput.min = '0';
        this.TyposAllowCountInput.addEventListener('change', this.StateChanged.bind(this));
        this.TyposFieldset.appendChild(this.TyposAllowCountInput);

        this.AddContent(this.TyposFieldset);

        let hr = document.createElement('hr');
        hr.classList.add('spaced');
        this.AddContent(hr);

        this.AnswersTable = new AnswersTable();
        this.AddContent(this.AnswersTable.GetElement());

        this.ErrorWrapper = document.createElement('div');
        this.ErrorWrapper.classList.add('error');
        this.AddContent(this.ErrorWrapper);

        this.SetHeader('Edytuj pytanie');
        this.DisplayHelpButton();

        this.SaveButton = document.createElement('button');
        this.SaveButton.textContent = 'Zapisz';
        this.SaveButton.addEventListener('click', this.SaveChanges.bind(this));
        this.AddButton(this.SaveButton);

        this.CancelButton = document.createElement('button');
        this.CancelButton.classList.add('secondary');
        this.CancelButton.textContent = 'Anuluj';
        this.CancelButton.addEventListener('click', this.CancelChanges.bind(this));
        this.AddButton(this.CancelButton);
    }

    async PopulateAndShow(question?: Question){
        this.Question = question;
        this.IgnoreChanges = true;
        this.TextTextarea.value = await question?.GetText() ?? '';
        this.TypeSelect.value = (await question?.GetType() ?? 0).toString();
        this.PointsInput.value = (await question?.GetPoints() ?? 1).toString();
        this.UpdateFieldsetVisibilityBasedOnQuestionType();

        switch(await question?.GetPointsCounting() ?? Question.COUNTING_BINARY){
            case Question.COUNTING_BINARY:
                this.CountingBinaryRadio.checked = true;
                break;
            case Question.COUNTING_LINEAR:
                this.CountingLinearRadio.checked = true;
                break;
        }

        let typos_count = await question?.GetMaxTypos() ?? 0;
        if(typos_count == 0){
            this.TyposDisallowRadio.checked = true;
            this.TyposAllowCountInput.value = '1';
        }else{
            this.TyposAllowRadio.checked = true;
            this.TyposAllowCountInput.value = typos_count.toString();
        }
        this.UpdateTyposCountEnableState();

        this.Show();

        this.AnswersTable.Populate(question);
        this.IgnoreChanges = false;

        return new Promise<Question>((resolve, reject) => {
            this.PromiseResolve = resolve;
            this.PromiseReject = reject;
        });
    }

    protected CancelChanges(){
        if(PageManager.IsPreventedFromNavigationBy('question-editor')){
            let confirm_result = window.confirm('Zmiany w tym pytaniu nie zostały zapisane.\nCzy chcesz wyjść mimo to?');
            if(!confirm_result) return;
        }
        this.Hide();
        this.AnswersTable.ClearContent();
        PageManager.UnpreventFromNavigation('question-editor');
        this.PromiseReject?.();
    }

    protected async SaveChanges(){
        if(this.Test === undefined){
            this.Hide();
            this.PromiseReject?.();
            return;
        }

        // Validate()

        let text = this.TextTextarea.value;
        let type = parseInt(this.TypeSelect.value);
        let points = parseFloat(this.PointsInput.value);

        let points_counting = 0;
        if(this.CountingBinaryRadio.checked) points_counting = Question.COUNTING_BINARY;
        if(this.CountingLinearRadio.checked) points_counting = Question.COUNTING_LINEAR;

        let max_typos = parseInt(this.TyposAllowCountInput.value);
        if(this.TyposDisallowRadio.checked) max_typos = 0;

        let saving_toast = Toasts.ShowPersistent('Zapisywanie pytania...');
        this.SaveButton.disabled = true;
        this.CancelButton.disabled = true;

        try{
            
            if(this.Question === undefined){
                // Create a question
                let new_question = await Question.Create(
                    this.Test,
                    text,
                    type,
                    points,
                    points_counting,
                    max_typos
                );

                this.Question = new_question;
                this.AnswersTable.Question = new_question;
                await this.AnswersTable.Save();
            }else{
                // Update the question - only if it's been changed
                let update_awaiter: (Promise<void> | undefined) = undefined;
                if(this.IsChanged){
                    update_awaiter = this.Question.Update(
                        text,
                        type,
                        points,
                        points_counting,
                        max_typos
                    );
                }

                let answers_table_awaiter = this.AnswersTable.Save();

                if(update_awaiter !== undefined)
                    await update_awaiter;
                await answers_table_awaiter;
            }

            Toasts.Show('Pytanie zostało zapisane.');
            this.Hide();
            this.AnswersTable.ClearContent();
            PageManager.UnpreventFromNavigation('question-editor');
            this.PromiseResolve?.(this.Question);

        }catch(e){
            Toasts.Show('Nie udało się zapisać pytania.');
        }finally{
            saving_toast.Hide();
            this.SaveButton.disabled = false;
            this.CancelButton.disabled = false;
        }
    }

    protected StateChanged(){
        if(this.IgnoreChanges) return;
        this.IsChanged = true;
        PageManager.PreventFromNavigation('question-editor');
    }

    protected UpdateTyposCountEnableState(){
        this.TyposAllowCountInput.disabled = !this.TyposAllowRadio.checked;
        this.StateChanged();
    }

    protected UpdateFieldsetVisibilityBasedOnQuestionType(){
        let type = parseInt(this.TypeSelect.value);

        this.CountingFieldset.style.display = 'none';
        this.TyposFieldset.style.display = 'none';

        switch(type){
            case Question.TYPE_MULTI_CHOICE:
                this.CountingFieldset.style.display = 'block';
                break;
            case Question.TYPE_OPEN_ANSWER:
                this.TyposFieldset.style.display = 'block';
                break;
        }
        this.StateChanged();
    }
}
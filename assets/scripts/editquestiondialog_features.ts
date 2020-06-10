import * as TestEditor from './testeditor';
import * as Tests from './tests';
import * as Typedefs from './typedefs';
import { GetElement } from './functions';

export default class EditQuestionDialogFeatures {
    QuestionText: HTMLInputElement;
    QuestionType: HTMLSelectElement;
    Points: HTMLInputElement;
    PointsCounting: {
        Root: HTMLElement,
        Binary: HTMLInputElement,
        Linear: HTMLInputElement
    };
    Typos: {
        Root: HTMLElement,
        Disallow: HTMLInputElement,
        Allow: HTMLInputElement,
        AllowCount: HTMLInputElement
    };
    Answers: HTMLElement;
    ErrorBox: HTMLElement;

    constructor(){
        this.QuestionText = GetElement('question-text') as HTMLInputElement;
        this.QuestionType = GetElement('question-type') as HTMLSelectElement;
        this.Points = GetElement('points') as HTMLInputElement;

        this.PointsCounting = {
            Root: GetElement('points-counting-fieldset'),
            Binary: GetElement('points-counting-binary') as HTMLInputElement,
            Linear: GetElement('points-counting-linear') as HTMLInputElement,
        };

        this.Typos = {
            Root: GetElement('typos-fieldset'),
            Disallow: GetElement('typos-disallow') as HTMLInputElement,
            Allow: GetElement('typos-allow') as HTMLInputElement,
            AllowCount: GetElement('typos-allow-count') as HTMLInputElement,
        };

        this.Answers = GetElement('answers-tbody');
        this.ErrorBox = GetElement('edit-question-error');
    }

    CheckCountingField(counting: number){
        switch(counting){
            case Tests.COUNTING_BINARY:
                this.PointsCounting.Binary.checked = true;
                break;
            case Tests.COUNTING_LINEAR:
                this.PointsCounting.Linear.checked = true;
                break;
        }
    }

    GetCountingValue(){
        if(this.PointsCounting.Binary.checked) return Tests.COUNTING_BINARY;
        if(this.PointsCounting.Linear.checked) return Tests.COUNTING_LINEAR;
        return 0;
    }

    OnQuestionTypeChange(){
        this.PointsCounting.Root.style.display = parseInt(this.QuestionType.value) == Tests.TYPE_MULTI_CHOICE ? 'block' : 'none';
        this.Typos.Root.style.display = parseInt(this.QuestionType.value) == Tests.TYPE_OPEN_ANSWER ? 'block' : 'none';
    }

    GetMaxTypos(){
        if(parseInt(this.QuestionType.value) != Tests.TYPE_OPEN_ANSWER) return 0;
        if(this.Typos.Disallow.checked) return 0;
        return parseInt(this.Typos.AllowCount.value);
    }

    CheckTyposField(max_typos: number){
        if(max_typos == 0) this.Typos.Disallow.checked = true;
        else this.Typos.Allow.checked = true;

        this.Typos.AllowCount.value = max_typos.toString();
        this.EnableMaxTyposInputFieldIfNeeded();
    }

    EnableMaxTyposInputFieldIfNeeded(){
        this.Typos.AllowCount.disabled = !this.Typos.Allow.checked;
    }

    DisplayAnswers(){
        this.Answers.textContent = '';

        TestEditor.GetDialog().AnswerList.forEach(this.AppendAnswer.bind(this));
    }

    AppendAnswer(answer: Typedefs.AnswerDescriptor, index: number){
        let tr = document.createElement('tr');
        tr.dataset.answerId = answer.id.toString();
        tr.dataset.rowNumber = (index + 1).toString();

        let td_num = document.createElement('td');
        td_num.classList.add('secondary');
        td_num.innerText = (index + 1) + '.';

        let td_text = document.createElement('td');
        let text_input = document.createElement('input');
        text_input.classList.add('discreet');
        text_input.type = 'text';
        text_input.value = answer.text;
        text_input.addEventListener('change', () => {this.OnAnswerChange(answer.id, text_input.value, undefined);});
        td_text.appendChild(text_input);

        let td_correct = document.createElement('td');
        td_correct.classList.add('center');
        let correct_cb = document.createElement('input');
        correct_cb.type = 'checkbox';
        correct_cb.checked = answer.correct;
        correct_cb.addEventListener('change', () => {this.OnAnswerChange(answer.id, undefined, correct_cb.checked);});
        td_correct.appendChild(correct_cb);

        let td_rem = document.createElement('td');
        let rem_btn = document.createElement('button');
        rem_btn.classList.add('compact', 'error', 'fa', 'fa-trash');
        rem_btn.title = 'Usuń';
        rem_btn.addEventListener('click', () => {TestEditor.GetDialog().RemoveAnswer(answer.id);});
        td_rem.appendChild(rem_btn);

        tr.appendChild(td_num);
        tr.appendChild(td_text);
        tr.appendChild(td_correct);
        tr.appendChild(td_rem);

        this.Answers.appendChild(tr);
    }

    RemoveAnswer(ans_id: number){
        let ans_number = 1;
        let children_array = Array.prototype.slice.call(this.Answers.children);
        children_array.forEach((tr) => {
            if(tr.dataset.answerId == ans_id){
                tr.remove();
            }else{
                TestEditor.UpdateRowNumber(tr, ans_number);
                ans_number++;
            }
        });
    }

    OnAnswerChange(ans_id: number, new_val?: string, is_correct?: boolean){
        TestEditor.GetDialog().AnswerList.forEach((answer, index) => {
            if(answer.id == ans_id){
                if(new_val !== undefined) TestEditor.GetDialog().AnswerList[index].text = new_val;
                if(is_correct !== undefined) TestEditor.GetDialog().AnswerList[index].correct = is_correct;
                TestEditor.GetDialog().MadeChanges();
            }
        });
    }
}
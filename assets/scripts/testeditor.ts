import * as GlobalState from './globalstate';
import * as Tests from './tests';
import * as Toasts from './toasts';
import * as Typedefs from './typedefs';

import EditQuestionDialog from './editquestiondialog';
import { GetElement, Truncate } from './functions';
import { RemoveQuestionXHR, RemoveTestXHR, SaveTestXHR } from './remote_ifaces';

let AutoQuestionId = -1;
let Questions: Typedefs.QuestionList = {};
let TestId = 0;
let Dialog: EditQuestionDialog;

export function LoadQuestions(test_id: number, questions: Typedefs.QuestionList){
    TestId = test_id;
    Questions = questions;
    GetDialog(); // In order to initialize dialog
}

export function GetQuestions(){
    return Questions;
}

export function GetQuestion(question_id: number){
    return Questions[question_id];
}

export function SetQuestion(index: number, question: Typedefs.QuestionDescriptor){
    Questions[index] = question;
}

export function GetTestId(){
    return TestId;
}

export function GetDialog(){
    if(Dialog == undefined) Dialog = new EditQuestionDialog();
    return Dialog;
}

export function AddQuestion(){
    let new_question: Typedefs.QuestionDescriptor = {
        id: AutoQuestionId,
        text: '',
        type: Tests.TYPE_SINGLE_CHOICE,
        points: 1,
        points_counting: Tests.COUNTING_BINARY,
        answers: [],
        persistent: false,
        max_typos: 0
    };

    Questions[AutoQuestionId] = new_question;
    AutoQuestionId--;

    AppendQuestionRow(new_question.id);
    EditQuestion(new_question.id);
}

export function EditQuestion(question_id: number){
    Questions[question_id].persistent = Questions[question_id].persistent ?? true;
    Dialog.AnswerList = Questions[question_id].answers.map(o => Object.assign({}, o)); // clone

    Dialog.Features.QuestionText.value = Questions[question_id].text;
    Dialog.Features.QuestionType.value = Questions[question_id].type.toString();
    Dialog.Features.Points.value = Questions[question_id].points.toString();
    Dialog.Features.CheckCountingField(Questions[question_id].points_counting);
    Dialog.Features.CheckTyposField(Questions[question_id].max_typos);
    Dialog.Features.OnQuestionTypeChange();
    Dialog.Features.DisplayAnswers();

    Dialog.ClearErrorStates();

    Dialog.Display(question_id);
}

export function RemoveQuestion(question_id: number){
    if(!window.confirm('Usunięcie pytania jest nieodwracalne.\nKontynuować?')) return;

    if(question_id > 0){
        let data_to_send: RemoveQuestionXHR = {
            question_id: question_id
        };

        let remover = $.post('api/remove_question', JSON.stringify(data_to_send));

        remover.fail(() => {
            Toasts.Show('Nie udało się usunąć pytania.');
        });
        remover.done((data) => {
            if(data.is_success === undefined)
                Toasts.Show('Wystąpił nieznany błąd podczas usuwania pytania.');
            else if(data.is_success === false)
                Toasts.Show('Błąd: ' + data.message);
            else{
                Toasts.Show('Pytanie zostało usunięte.');
                delete Questions[question_id];
                RemoveQuestionRow(question_id);
            }
        });
    }else{
        delete Questions[question_id];
        RemoveQuestionRow(question_id);
    }
}

export function UpdateRowNumber(tr: HTMLTableRowElement, row_number: number){
    if(tr.children[0] == undefined) throw 'Nie istnieje komórka #0, do której próbowano wstawić numer wiersza.';

    tr.dataset.rowNumber = row_number.toString();
    (<HTMLTableCellElement>tr.children[0]).innerText = row_number + '.';
}

function AppendQuestionRow(question_id: number){
    let questions_tbody = GetElement('questions-tbody');

    let tr = document.createElement('tr');
    tr.dataset.rowNumber = Object.keys(Questions).length.toString();
    tr.dataset.questionId = question_id.toString();

    let td_num = document.createElement('td');
    td_num.classList.add('secondary');
    td_num.innerText = tr.dataset.rowNumber + '.';
    tr.appendChild(td_num);

    let td_text = document.createElement('td');
    td_text.innerHTML = Truncate(Questions[question_id].text, 60);
    tr.appendChild(td_text);

    let td_pts = document.createElement('td');
    td_pts.classList.add('center');
    td_pts.innerText = Questions[question_id].points.toLocaleString();
    tr.appendChild(td_pts);

    let td_btn = document.createElement('td');
    let edit_btn = document.createElement('button');
    edit_btn.classList.add('compact');
    edit_btn.innerText = 'Edytuj';
    edit_btn.addEventListener('click', () => {EditQuestion(question_id);});
    td_btn.appendChild(edit_btn);
    tr.appendChild(td_btn);

    let td_rem = document.createElement('td');
    let rem_btn = document.createElement('button');
    rem_btn.classList.add('compact', 'error', 'fa', 'fa-trash');
    rem_btn.addEventListener('click', () => {RemoveQuestion(question_id);});
    td_rem.appendChild(rem_btn);
    tr.appendChild(td_rem);

    questions_tbody.appendChild(tr);
}

export function UpdateQuestionRow(question_id: number){
    let tbody = GetElement('questions-tbody');

    let children_array = Array.prototype.slice.call(tbody.children);
    children_array.forEach((tr) => {
        if(tr.dataset.questionId != question_id) return;
        tr.children[1].innerText = Truncate(Questions[question_id].text, 60);
        tr.children[2].innerText = Questions[question_id].points;
    });
}

function RemoveQuestionRow(question_id: number){
    let tbody = GetElement('questions-tbody');

    let children_array = Array.prototype.slice.call(tbody.children);
    let q_index = 1;
    children_array.forEach((tr) => {
        if(tr.dataset.questionId == question_id){
            tr.remove();
        }else{
            UpdateRowNumber(tr, q_index);
            q_index++;
        }
    });
}

export function UpdateTimeLimitInput(){
    MadeChangesToTestSettings();

    let time_limit_input = GetElement('set-time-limit') as HTMLInputElement;
    let with_time_limit_input = GetElement('with-time-limit') as HTMLInputElement;

    time_limit_input.disabled = !with_time_limit_input.checked;
}

export function MadeChangesToTestSettings(){
    GlobalState.AddPreventFromExitReason('test_settings');
}

export function SaveTestSettings(){
    let question_name_input = GetElement('question-name-input') as HTMLInputElement;
    let question_multiplier_input = GetElement('question-multiplier') as HTMLInputElement;
    let time_limit_input = GetElement('set-time-limit') as HTMLInputElement;

    let data_to_send: SaveTestXHR = {
        test_id: TestId,
        test_name: question_name_input.value,
        question_multiplier: parseFloat(question_multiplier_input.value),
        time_limit: parseInt(time_limit_input.value) * 60
    };
    if(time_limit_input.disabled) data_to_send.time_limit = 0;

    let saving_toast = Toasts.ShowPersistent('Zapisywanie...');

    let saver = $.post('api/save_test', JSON.stringify(data_to_send));

    saver.fail(() => {
        saving_toast.Hide();
        alert('Nie udało się zapisać ustawień.');
    });
    saver.done((data) => {
        saving_toast.Hide();
        if(data.is_success === undefined)
            alert('Wystąpił nieznany błąd podczas zapisywania ustawień.');
        else if(data.is_success === false)
            alert('Błąd: ' + data.message);
        else{
            Toasts.Show('Ustawienia zostały zapisane.');
            UpdateTestTitle(data_to_send.test_name);
            GlobalState.RemovePreventFromExitReason('test_settings');
        }
    });
}

function UpdateTestTitle(new_title: string){
    let heading_element = GetElement('heading-test-title');

    heading_element.innerText = new_title;
}

export function RemoveTest(){
    if(!window.confirm('Usunięcia testu nie da się cofnąć. Usunąć mimo to?')) return;

    let data_to_send: RemoveTestXHR = {
        test_id: TestId
    };

    let removing_toast = Toasts.ShowPersistent('Usuwanie...');

    let remover = $.post('api/remove_test', JSON.stringify(data_to_send));

    remover.fail(() => {
        removing_toast.Hide();
        alert('Nie udało się usunąć testu.');
    });
    remover.done((data) => {
        if(data.is_success === undefined){
            removing_toast.Hide();
            alert('Wystąpił nieznany błąd podczas usuwania testu.');
        }else if(data.is_success === false){
            removing_toast.Hide();
            alert('Błąd: ' + data.message);
        }else{
            window.location.href = 'testy/biblioteka';
        }
    });
}
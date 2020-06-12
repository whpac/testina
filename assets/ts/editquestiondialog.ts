import * as Dialogs from './dialogs';
import * as GlobalState from './globalstate';
import * as TestEditor from './testeditor';
import * as Tests from './tests';
import * as Toasts from './toasts';
import * as Typedefs from './typedefs';
import EditQuestionDialogFeatures from './editquestiondialog_features';

import { $Handles } from './eventhandlers';
import { GetElement } from './functions';

import { SaveQuestionXHR } from './remote_ifaces';

export default class EditQuestionDialog{
    AnswerList: Typedefs.AnswerDescriptor[] = [];
    AreChangesMade = false;
    AutoAnswerId = -1;
    DialogElement: HTMLElement;
    Features = new EditQuestionDialogFeatures();
    QuestionId = 0;
    RemovedAnswers: number[] = [];

    constructor(){
        this.DialogElement = GetElement('question-dialog');

        $Handles('.event-edit-question-made-changes', 'change', this.MadeChanges.bind(this));
        $Handles('#add-answer-button', 'click', this.AddAnswer.bind(this));
        $Handles('#save-question-button', 'click', this.SaveChanges.bind(this));
        $Handles('#cancel-question-changes-button', 'click', this.CancelChanges.bind(this));
    }

    Display(question_id: number){
        this.AreChangesMade = false;
        this.RemovedAnswers = [];
        this.AnswerList = this.AnswerList ?? [];
        this.QuestionId = question_id;
        Dialogs.ShowDialog(this.DialogElement);
    }

    Hide(){
        Dialogs.HideDialog(this.DialogElement);
        GlobalState.RemovePreventFromExitReason('question_editor');
    }

    CancelChanges(){
        if(this.AreChangesMade)
            if(!window.confirm('Wszystkie zmiany w tym pytaniu zostaną odrzucone.\nCzy kontynuować?'))
                return;

        if(!TestEditor.GetQuestion(this.QuestionId).persistent)
            TestEditor.RemoveQuestion(this.QuestionId);

        this.Hide();
    }

    SaveChanges(){
        if(!this.Validate()) return;
        this.Hide();

        let data_to_send: SaveQuestionXHR = {
            test_id: TestEditor.GetTestId(),
            question_id: this.QuestionId,
            text: this.Features.QuestionText.value,
            type: parseInt(this.Features.QuestionType.value),
            points: parseFloat(this.Features.Points.value),
            points_counting: this.Features.GetCountingValue(),
            max_typos: this.Features.GetMaxTypos(),
            answers: this.AnswerList,
            removed_answers: this.RemovedAnswers,
        };

        let saving_toast = Toasts.ShowPersistent('Zapisywanie...');

        let saver = $.post('api/save_question', JSON.stringify(data_to_send));

        saver.fail(() => {
            saving_toast.Hide();
            alert('Nie udało się zapisać pytania.');
        });
        saver.done((data) => {
            saving_toast.Hide();
            if(data.is_success === undefined)
                alert('Wystąpił nieznany błąd podczas zapisywania pytania.');
            else if(data.is_success === false)
                alert('Błąd: ' + data.message);
            else{
                Toasts.Show('Pytanie zostało zapisane.');
                this.UpdateQuestion();
            }
        });
    }

    ClearErrorStates(){
        this.Features.ErrorBox.innerText = '';
        this.Features.QuestionText.classList.remove('error');
    }

    Validate(){
        let errors = [];
        this.ClearErrorStates();
        
        if(this.Features.QuestionText.value.length == 0){
            this.Features.QuestionText.classList.add('error');
            errors.push('Treść pytania nie może być pusta.');
        }

        if(this.AnswerList.length == 0){
            errors.push('Pytanie musi mieć przynajmniej jeden wariant odpowiedzi.');
        }

        let correct_answers_count = 0;
        this.AnswerList.forEach((answer) => {
            if(answer.correct) correct_answers_count++;
        });
        if(TestEditor.GetQuestions()[this.QuestionId].type == Tests.TYPE_SINGLE_CHOICE){
            if(correct_answers_count != 1)
                errors.push('Pytanie jednokrotnego wyboru musi mieć dokładnie jedną poprawną odpowiedź.');
        }
        if(TestEditor.GetQuestions()[this.QuestionId].type == Tests.TYPE_MULTI_CHOICE){
            if(correct_answers_count == 0)
                errors.push('Pytanie wielokrotnego wyboru musi mieć przynajmniej jedną poprawną odpowiedź.');
        }

        let error_text = '';
        errors.forEach((err) => {
            error_text += err + '<br />';
        });
        this.Features.ErrorBox.innerHTML = error_text;

        return errors.length == 0;
    }

    MadeChanges(){
        this.AreChangesMade = true;
        GlobalState.AddPreventFromExitReason('question_editor');

        this.Features.EnableMaxTyposInputFieldIfNeeded();
    }

    RemoveAnswer(ans_id: number){
        if(!window.confirm('Jeżeli zapiszesz pytanie, usuniętej odpowiedzi nie będzie się dało przywrócić.\nKontynuować?')) return;

        this.AnswerList.forEach((answer, index) => {
            if(ans_id != answer.id) return;
            this.AreChangesMade = true;
            this.Features.RemoveAnswer(ans_id);
            this.AnswerList.splice(index, 1);
            this.RemovedAnswers.push(ans_id);
        });
    }

    AddAnswer(){
        let ans = {
            id: this.AutoAnswerId,
            text: '',
            correct: false
        };
        this.AreChangesMade = true;
        this.AnswerList.push(ans);
        this.Features.AppendAnswer(ans, this.AnswerList.length - 1);
        this.AutoAnswerId--;
    }

    UpdateQuestion(){
        let q = {
            id: this.QuestionId,
            answers: this.AnswerList.map(a => Object.assign({}, a)),
            text: this.Features.QuestionText.value,
            type: parseInt(this.Features.QuestionType.value),
            points: parseFloat(this.Features.Points.value),
            points_counting: this.Features.GetCountingValue(),
            max_typos: this.Features.GetMaxTypos(),
            persistent: true
        };
        TestEditor.SetQuestion(this.QuestionId, q);
        TestEditor.UpdateQuestionRow(this.QuestionId);
    }

    OnQuestionTypeChange(){
        this.MadeChanges();
        this.Features.OnQuestionTypeChange();
    }
}
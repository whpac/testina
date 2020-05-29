var TestEditor = {

    AutoQuestionId: -1,
    Questions: {},
    TestId: 0,

    LoadQuestions: function(questions){
        this.Questions = questions;
        this.EditQuestionDialog.Initialize();
    },

    AddQuestion: function(){
        let new_question = {};

        new_question.id = this.AutoQuestionId;
        new_question.text = '';
        new_question.type = Tests.TYPE_SINGLE_CHOICE;
        new_question.points = 1;
        new_question.points_counting = Tests.COUNTING_BINARY;
        new_question.answers = [];
        new_question.persistent = false;

        this.Questions[this.AutoQuestionId] = new_question;
        this.AutoQuestionId--;

        this.AppendQuestionRow(new_question.id);
        this.EditQuestion(new_question.id);
    },

    EditQuestion: function(question_id){
        this.EditQuestionDialog.AnswerList = this.Questions[question_id].answers.map(o => Object.assign({}, o)); // clone
        this.EditQuestionDialog.QuestionId = question_id;

        this.EditQuestionDialog.Features.QuestionText.value = this.Questions[question_id].text;
        this.EditQuestionDialog.Features.QuestionType.value = this.Questions[question_id].type;
        this.EditQuestionDialog.Features.Points.value = this.Questions[question_id].points;
        this.EditQuestionDialog.Features.CheckCountingField(this.Questions[question_id].points_counting);
        this.EditQuestionDialog.Features.DisplayAnswers();

        this.EditQuestionDialog.ClearErrorStates();

        this.EditQuestionDialog.Display();
    },

    RemoveQuestion: function(question_id){
        if(!window.confirm('Usunięcie pytania jest nieodwracalne.\nKontynuować?')) return;

        if(question_id > 0){
            let data_to_send = {};
            data_to_send.question_id = question_id;

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
                    delete this.Questions[question_id];
                    this.RemoveQuestionRow(question_id);
                }
            });
        }else{
            delete this.Questions[question_id];
            this.RemoveQuestionRow(question_id);
        }
    },

    EditQuestionDialog: {
        AnswerList: [],
        AreChangesMade: false,
        AutoAnswerId: -1,
        Element: undefined,
        QuestionId: 0,
        RemovedAnswers: [],

        Features: {
            CheckCountingField: function(counting){
                switch(counting){
                    case Tests.COUNTING_BINARY:
                        this.PointsCounting.Binary.checked = true;
                        break;
                    case Tests.COUNTING_LINEAR:
                        this.PointsCounting.Linear.checked = true;
                        break;
                }
            },

            GetCountingValue: function(){
                if(this.PointsCounting.Binary.checked) return Tests.COUNTING_BINARY;
                if(this.PointsCounting.Linear.checked) return Tests.COUNTING_LINEAR;
                return 0;
            },

            DisplayAnswers: function(){
                this.Answers.textContent = '';

                TestEditor.EditQuestionDialog.AnswerList.forEach(this.AppendAnswer.bind(this));
            },

            AppendAnswer: function(answer, index){
                let tr = document.createElement('tr');
                tr.dataset.answerId = answer.id;
                tr.dataset.rowNumber = index + 1;

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
                rem_btn.addEventListener('click', () => {TestEditor.EditQuestionDialog.RemoveAnswer(answer.id);});
                td_rem.appendChild(rem_btn);

                tr.appendChild(td_num);
                tr.appendChild(td_text);
                tr.appendChild(td_correct);
                tr.appendChild(td_rem);

                this.Answers.appendChild(tr);
            },

            RemoveAnswer: function(ans_id){
                ans_number = 1;
                let children_array = Array.prototype.slice.call(this.Answers.children);
                children_array.forEach((tr) => {
                    if(tr.dataset.answerId == ans_id){
                        tr.remove();
                    }else{
                        TestEditor.UpdateRowNumber(tr, ans_number);
                        ans_number++;
                    }
                });
            },

            OnAnswerChange: function(ans_id, new_val, is_correct){
                TestEditor.EditQuestionDialog.AnswerList.forEach((answer, index) => {
                    if(answer.id == ans_id){
                        if(new_val !== undefined) TestEditor.EditQuestionDialog.AnswerList[index].text = new_val;
                        if(is_correct !== undefined) TestEditor.EditQuestionDialog.AnswerList[index].correct = is_correct;
                        TestEditor.EditQuestionDialog.AreChangesMade = true;
                    }
                });
            }
        },

        Display: function(){
            if(this.Element === undefined)
                this.Initialize();

            this.AreChangesMade = false;
            this.RemovedAnswers = [];
            Dialogs.ShowDialog(this.Element);
        },

        Hide: function(){
            Dialogs.HideDialog(this.Element);
            GlobalState.RemovePreventFromExitReason('question_editor');
        },

        CancelChanges: function(){
            if(this.AreChangesMade)
                if(!window.confirm('Wszystkie zmiany w tym pytaniu zostaną odrzucone.\nCzy kontynuować?'))
                    return;
            
            if(!TestEditor.Questions[this.QuestionId].persistent)
                TestEditor.RemoveQuestion(this.QuestionId);

            this.Hide();
        },

        SaveChanges: function(){
            if(!this.Validate()) return;
            this.Hide();

            let data_to_send = {};
            data_to_send.test_id = TestEditor.TestId;
            data_to_send.question_id = this.QuestionId;
            data_to_send.text = this.Features.QuestionText.value;
            data_to_send.type = this.Features.QuestionType.value;
            data_to_send.points = this.Features.Points.value;
            data_to_send.points_counting = this.Features.GetCountingValue();
            data_to_send.answers = this.AnswerList;
            data_to_send.removed_answers = this.RemovedAnswers;

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
                    this.UpdateQuestion(this.QuestionId);
                }
            });
        },

        ClearErrorStates: function(){
            this.Features.ErrorBox.innerText = '';
            this.Features.QuestionText.classList.remove('error');
        },

        Validate: function(){
            let errors = [];
            this.ClearErrorStates();
            
            if(this.Features.QuestionText.value.length == 0){
                this.Features.QuestionText.classList.add('error');
                errors.push('Treść pytania nie może być pusta.');
            }

            let correct_answers_count = 0;
            this.AnswerList.forEach((answer) => {
                if(answer.correct) correct_answers_count++;
            });
            if(TestEditor.Questions[this.QuestionId].type == Tests.TYPE_SINGLE_CHOICE){
                if(correct_answers_count != 1)
                    errors.push('Pytanie jednokrotnego wyboru musi mieć dokładnie jedną poprawną odpowiedź.');
            }
            if(TestEditor.Questions[this.QuestionId].type == Tests.TYPE_MULTI_CHOICE){
                if(correct_answers_count == 0)
                    errors.push('Pytanie wielokrotnego wyboru musi mieć przynajmniej jedną poprawną odpowiedź.');
            }

            error_text = '';
            errors.forEach((err) => {
                error_text += err + '<br />';
            });
            this.Features.ErrorBox.innerHTML = error_text;

            return errors.length == 0;
        },

        Initialize: function(){
            this.Element = document.getElementById('question-dialog');
            this.Features.QuestionText = document.getElementById('question-text');
            this.Features.QuestionType = document.getElementById('question-type');
            this.Features.Points = document.getElementById('points');

            this.Features.PointsCounting = {};
            this.Features.PointsCounting.Binary = document.getElementById('points-counting-binary');
            this.Features.PointsCounting.Linear = document.getElementById('points-counting-linear');

            this.Features.Answers = document.getElementById('answers-tbody');
            this.Features.ErrorBox = document.getElementById('edit-question-error');
        },

        MadeChanges: function(){
            this.AreChangesMade = true;
            GlobalState.AddPreventFromExitReason('question_editor');
        },

        RemoveAnswer: function(ans_id){
            if(!window.confirm('Jeżeli zapiszesz pytanie, usuniętej odpowiedzi nie będzie się dało przywrócić.\nKontynuować?')) return;

            this.AnswerList.forEach((answer, index) => {
                if(ans_id != answer.id) return;
                this.AreChangesMade = true;
                this.Features.RemoveAnswer(ans_id);
                this.AnswerList.splice(index, 1);
                this.RemovedAnswers.push(ans_id);
            });
        },

        AddAnswer: function(){
            let ans = {
                id: this.AutoAnswerId,
                text: '',
                correct: false
            };
            this.AreChangesMade = true;
            this.AnswerList.push(ans);
            this.Features.AppendAnswer(ans, this.AnswerList.length - 1);
            this.AutoAnswerId--;
        },

        UpdateQuestion: function(question_id){
            TestEditor.Questions[question_id].answers = this.AnswerList.map(a => Object.assign({}, a));
            TestEditor.Questions[question_id].text = this.Features.QuestionText.value;
            TestEditor.Questions[question_id].type = this.Features.QuestionType.value;
            TestEditor.Questions[question_id].points = this.Features.Points.value;
            TestEditor.Questions[question_id].points_counting = this.Features.GetCountingValue();
            TestEditor.Questions[question_id].persistent = true;
            TestEditor.UpdateQuestionRow(question_id);
        }
    },

    UpdateRowNumber: function(tr, row_number){
        tr.dataset.rowNumber = row_number;
        tr.children[0].innerText = row_number + '.';
    },

    AppendQuestionRow: function(question_id){
        let questions_tbody = document.getElementById('questions-tbody');
        let tr = document.createElement('tr');
        tr.dataset.rowNumber = Object.keys(this.Questions).length;
        tr.dataset.questionId = question_id;

        let td_num = document.createElement('td');
        td_num.classList.add('secondary');
        td_num.innerText = tr.dataset.rowNumber + '.';
        tr.appendChild(td_num);

        let td_text = document.createElement('td');
        td_text.innerHTML = truncate(this.Questions[question_id].text, 60);
        tr.appendChild(td_text);

        let td_pts = document.createElement('td');
        td_pts.classList.add('center');
        td_pts.innerText = this.Questions[question_id].points;
        tr.appendChild(td_pts);

        let td_btn = document.createElement('td');
        let edit_btn = document.createElement('button');
        edit_btn.classList.add('compact');
        edit_btn.innerText = 'Edytuj';
        edit_btn.addEventListener('click', () => {TestEditor.EditQuestion(question_id);});
        td_btn.appendChild(edit_btn);
        tr.appendChild(td_btn);

        let td_rem = document.createElement('td');
        let rem_btn = document.createElement('button');
        rem_btn.classList.add('compact', 'red', 'fa', 'fa-trash');
        rem_btn.addEventListener('click', () => {TestEditor.RemoveQuestion(question_id);});
        td_rem.appendChild(rem_btn);
        tr.appendChild(td_rem);

        questions_tbody.appendChild(tr);
    },

    UpdateQuestionRow: function(question_id){
        let tbody = document.getElementById('questions-tbody');
        let children_array = Array.prototype.slice.call(tbody.children);
        children_array.forEach((tr) => {
            if(tr.dataset.questionId != question_id) return;
            tr.children[1].innerText = truncate(this.Questions[question_id].text, 60);
            tr.children[2].innerText = this.Questions[question_id].points;
        });
    },

    RemoveQuestionRow: function(question_id){
        let tbody = document.getElementById('questions-tbody');
        let children_array = Array.prototype.slice.call(tbody.children);
        let q_index = 1;
        children_array.forEach((tr) => {
            if(tr.dataset.questionId == question_id){
                tr.remove();
            }else{
                this.UpdateRowNumber(tr, q_index);
                q_index++;
            }
        });
    },

    UpdateTimeLimitInput: function(){
        this.MadeChangesToTestSettings();
        document.getElementById('set-time-limit').disabled = document.getElementById('no-time-limit').checked;
    },

    MadeChangesToTestSettings: function(){
        GlobalState.AddPreventFromExitReason('test_settings');
    },

    SaveTestSettings: function(){
        let data_to_send = {};
        data_to_send.test_id = this.TestId;
        data_to_send.test_name = document.getElementById('question-name-input').value;
        data_to_send.question_multiplier = document.getElementById('question-multiplier').value;
        data_to_send.time_limit = document.getElementById('set-time-limit').value * 60;
        if(document.getElementById('set-time-limit').disabled) data_to_send.time_limit = 0;

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
                this.UpdateTestTitle(data_to_send.test_name);
                GlobalState.RemovePreventFromExitReason('test_settings');
            }
        });
    },

    UpdateTestTitle: function(new_title){
        document.getElementById('heading-test-title').innerText = new_title;
    }
}
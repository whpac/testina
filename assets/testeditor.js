var TestEditor = {

    Questions: [],

    LoadQuestions: function(questions){
        this.Questions = questions;
        this.EditQuestionDialog.Initialize();
    },

    AddQuestion: function(){

    },

    EditQuestion: function(question_id){
        this.EditQuestionDialog.AnswerList = this.Questions[question_id].answers.map(o => Object.assign({}, o)); // clone
        this.EditQuestionDialog.QuestionId = question_id;

        this.EditQuestionDialog.Features.QuestionText.value = this.Questions[question_id].text;
        this.EditQuestionDialog.Features.QuestionType.value = this.Questions[question_id].type;
        this.EditQuestionDialog.Features.Points.value = this.Questions[question_id].points;
        this.EditQuestionDialog.Features.CheckCountingField(this.Questions[question_id].points_counting);
        this.EditQuestionDialog.Features.DisplayAnswers();

        this.EditQuestionDialog.Display();
    },

    EditQuestionDialog: {
        AnswerList: [],
        AreChangesMade: false,
        Element: undefined,
        QuestionId: 0,

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
                text_input.addEventListener('change', () => {this.OnAnswerChange(answer.id, text_input.value);});
                td_text.appendChild(text_input);

                let td_correct = document.createElement('td');
                td_correct.classList.add('center');
                let correct_cb = document.createElement('input');
                correct_cb.type = 'checkbox';
                correct_cb.checked = answer.correct;
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

            OnAnswerChange: function(ans_id, new_val){
                TestEditor.EditQuestionDialog.AnswerList.forEach((answer, index) => {
                    if(answer.id == ans_id){
                        TestEditor.EditQuestionDialog.AnswerList[index].text = new_val;
                        TestEditor.EditQuestionDialog.AreChangesMade = true;
                    }
                });
            }
        },

        Display: function(){
            if(this.Element === undefined)
                this.Initialize();

            this.AreChangesMade = false;
            Dialogs.ShowDialog(this.Element);
        },

        Hide: function(){
            if(this.AreChangesMade)
                if(!window.confirm('Wszystkie zmiany w tym pytaniu zostaną odrzucone.\nCzy kontynuować?'))
                    return;
            
            Dialogs.HideDialog(this.Element);
        },

        SaveChanges: function(){
            Dialogs.HideDialog(this.Element);

            let data_to_send = {};
            data_to_send.question_id = this.QuestionId;
            data_to_send.text = this.Features.QuestionText.value;
            data_to_send.type = this.Features.QuestionType.value;
            data_to_send.points = this.Features.Points.value;
            data_to_send.points_counting = this.Features.GetCountingValue();
            data_to_send.answers = this.AnswerList;

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

        Initialize: function(){
            this.Element = document.getElementById('question-dialog');
            this.Features.QuestionText = document.getElementById('question-text');
            this.Features.QuestionType = document.getElementById('question-type');
            this.Features.Points = document.getElementById('points');

            this.Features.PointsCounting = {};
            this.Features.PointsCounting.Binary = document.getElementById('points-counting-binary');
            this.Features.PointsCounting.Linear = document.getElementById('points-counting-linear');

            this.Features.Answers = document.getElementById('answers-tbody');
        },

        RemoveAnswer: function(ans_id){
            this.AnswerList.forEach((answer, index) => {
                if(ans_id != answer.id) return;
                this.AreChangesMade = true;
                this.Features.RemoveAnswer(ans_id);
                this.AnswerList.splice(index, 1);
            });
        },

        AddAnswer: function(){
            let ans = {
                id: -1,
                text: '',
                correct: false
            };
            this.AreChangesMade = true;
            this.AnswerList.push(ans);
            this.Features.AppendAnswer(ans, this.AnswerList.length - 1);
        },

        UpdateQuestion: function(question_id){
            TestEditor.Questions[question_id].answers = this.AnswerList.map(a => Object.assign({}, a));
            TestEditor.Questions[question_id].text = this.Features.QuestionText.value;
            TestEditor.Questions[question_id].type = this.Features.QuestionType.value;
            TestEditor.Questions[question_id].points = this.Features.Points.value;
            TestEditor.Questions[question_id].points_counting = this.Features.GetCountingValue();
            TestEditor.UpdateQuestionRow(question_id, this.Features.QuestionText.value, this.Features.Points.value)
        }
    },

    UpdateRowNumber: function(tr, row_number){
        tr.dataset.rowNumber = row_number;
        tr.children[0].innerText = row_number + '.';
    },

    UpdateQuestionRow: function(question_id, text, points){
        let tbody = document.getElementById('questions-tbody');
        let children_array = Array.prototype.slice.call(tbody.children);
        children_array.forEach((tr) => {
            if(tr.dataset.questionId != question_id) return;
            tr.children[1].innerText = truncate(text, 60);
            tr.children[2].innerText = points;
        });
    }
}
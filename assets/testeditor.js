var TestEditor = {

    Questions: [],

    LoadQuestions: function(questions){
        this.Questions = questions;
        this.EditQuestionDialog.Initialize();
    },

    AddQuestion: function(){

    },

    EditQuestion: function(question_id){
        this.EditQuestionDialog.Features.QuestionText.value = this.Questions[question_id].text;
        this.EditQuestionDialog.Features.QuestionType.value = this.Questions[question_id].type;
        this.EditQuestionDialog.Features.Points.value = this.Questions[question_id].points;
        this.EditQuestionDialog.Features.CheckCountingField(this.Questions[question_id].points_counting);
        this.EditQuestionDialog.Features.DisplayAnswers(this.Questions[question_id].answers);

        this.EditQuestionDialog.AnswerList = this.Questions[question_id].answers.slice(0); // clone

        this.EditQuestionDialog.Display();
    },

    EditQuestionDialog: {
        AnswerList: [],
        AreChangesMade: false,
        Element: undefined,
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

            DisplayAnswers: function(answers){
                this.Answers.textContent = '';

                answers.forEach(this.AppendAnswer.bind(this));
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
            //TODO
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
        }
    },

    UpdateRowNumber: function(tr, row_number){
        tr.dataset.rowNumber = row_number;
        tr.children[0].innerText = row_number + '.';
    }
}
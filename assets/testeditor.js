var TestEditor = {

    Questions: [],

    LoadQuestions: function(questions){
        TestEditor.Questions = questions;
        TestEditor.EditQuestionDialog.Initialize();
    },

    AddQuestion: function(){

    },

    EditQuestion: function(question_id){
        TestEditor.EditQuestionDialog.Features.QuestionText.value = TestEditor.Questions[question_id].text;
        TestEditor.EditQuestionDialog.Features.QuestionType.value = TestEditor.Questions[question_id].type;
        TestEditor.EditQuestionDialog.Features.Points.value = TestEditor.Questions[question_id].points;
        TestEditor.EditQuestionDialog.Features.CheckCountingField(TestEditor.Questions[question_id].points_counting);
        TestEditor.EditQuestionDialog.Features.DisplayAnswers(TestEditor.Questions[question_id].answers);

        TestEditor.EditQuestionDialog.Display();
    },

    EditQuestionDialog: {
        Element: undefined,
        Features: {
            CheckCountingField: function(counting){
                switch(counting){
                    case Tests.COUNTING_BINARY:
                        TestEditor.EditQuestionDialog.Features.PointsCounting.Binary.checked = true;
                        break;
                    case Tests.COUNTING_LINEAR:
                        TestEditor.EditQuestionDialog.Features.PointsCounting.Linear.checked = true;
                        break;
                }
            },

            DisplayAnswers: function(answers){
                TestEditor.EditQuestionDialog.Features.Answers.textContent = '';

                answers.forEach((answer, index) => {
                    let tr = document.createElement('tr');

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
                    td_rem.appendChild(rem_btn);


                    tr.appendChild(td_num);
                    tr.appendChild(td_text);
                    tr.appendChild(td_correct);
                    tr.appendChild(td_rem);

                    TestEditor.EditQuestionDialog.Features.Answers.appendChild(tr);
                });
            }
        },

        Display: function(){
            if(TestEditor.EditQuestionDialog.Element === undefined)
                TestEditor.EditQuestionDialog.Initialize();

            Dialogs.ShowDialog(TestEditor.EditQuestionDialog.Element);
            return;
        },

        Hide: function(){
            Dialogs.HideDialog(TestEditor.EditQuestionDialog.Element);
        },

        Initialize: function(){
            TestEditor.EditQuestionDialog.Element = document.getElementById('question-dialog');
            TestEditor.EditQuestionDialog.Features.QuestionText = document.getElementById('question-text');
            TestEditor.EditQuestionDialog.Features.QuestionType = document.getElementById('question-type');
            TestEditor.EditQuestionDialog.Features.Points = document.getElementById('points');

            TestEditor.EditQuestionDialog.Features.PointsCounting = {};
            TestEditor.EditQuestionDialog.Features.PointsCounting.Binary = document.getElementById('points-counting-binary');
            TestEditor.EditQuestionDialog.Features.PointsCounting.Linear = document.getElementById('points-counting-linear');
            
            TestEditor.EditQuestionDialog.Features.Answers = document.getElementById('answers-tbody');
        }
    }
}
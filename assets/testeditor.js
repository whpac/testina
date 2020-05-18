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
                    td_text.innerText = answer.text;

                    let td_correct = document.createElement('td');
                    td_correct.classList.add('center');
                    let correct_cb = document.createElement('input');
                    correct_cb.type = 'checkbox';
                    correct_cb.checked = answer.correct;
                    td_correct.appendChild(correct_cb);

                    tr.appendChild(td_num);
                    tr.appendChild(td_text);
                    tr.appendChild(td_correct);

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

/*let dialog = Dialogs.CreateDialog();
dialog.AddClasses(['rich']);
dialog.SetHeader('Edytuj pytanie<a href="pomoc" class="get-help" title="Pomoc"><i class="fa fa-question-circle"></i></a>');

let form = document.createElement('div');
form.classList.add('grid-form');

let text_lbl = document.createElement('label');
text_lbl.htmlFor = 'question-text';
text_lbl.innerText = 'Treść:';
let text_area = document.createElement('textarea');
text_area.rows = 3;
text_area.id = 'question-text';

form.appendChild(text_lbl);
form.appendChild(text_area);

let type_lbl = document.createElement('label');
type_lbl.htmlFor = 'question-type';
type_lbl.innerText = 'Rodzaj:';
let type_select = document.createElement('select');
type_select.id = 'question-type';

let types = [[0, 'Wielokrotnego wyboru']];
types.forEach((option) => {
    let option_elem = document.createElement('option');
    option_elem.value = option[0];
    option_elem.innerText = option[1];
    type_select.appendChild(option_elem);
});

form.appendChild(type_lbl);
form.appendChild(type_select);

let points_lbl = document.createElement('label');
points_lbl.htmlFor = 'points';
points_lbl.innerText = 'Liczba punktów:';
let points_input = document.createElement('input');
points_input.type = 'text';
points_input.id = 'points';
points_input.size = 4;
points_input.classList.add('narrow');

form.appendChild(points_lbl);
form.appendChild(points_input);

let fieldset = document.createElement('div');
fieldset.classList.add('fieldset');

let points_counting_text = document.createElement('p');
points_counting_text.innerText = 'Sposób liczenia punktów:';
fieldset.appendChild(points_counting_text);

let points_counting_binary_radio = document.createElement('input');
points_counting_binary_radio.type = 'radio';
points_counting_binary_radio.name = 'points_counting';
points_counting_binary_radio.id = 'points-counting-binary';
let points_counting_binary_lbl = document.createElement('label');
points_counting_binary_lbl.htmlFor = 'points-counting-binary';
points_counting_binary_lbl.innerText = 'Zero-jedynkowo';
fieldset.appendChild(points_counting_binary_radio);
fieldset.appendChild(points_counting_binary_lbl);

fieldset.appendChild(document.createElement('br'));

let points_counting_linear_radio = document.createElement('input');
points_counting_linear_radio.type = 'radio';
points_counting_linear_radio.name = 'points_counting';
points_counting_linear_radio.id = 'points-counting-linear';
let points_counting_linear_lbl = document.createElement('label');
points_counting_linear_lbl.htmlFor = 'points-counting-linear';
points_counting_linear_lbl.innerText = 'Po ułamku za każdą poprawną odpowiedź';
fieldset.appendChild(points_counting_linear_radio);
fieldset.appendChild(points_counting_linear_lbl);

form.appendChild(fieldset);
dialog.AddContent(form);

let separator_hr = document.createElement('hr');
separator_hr.classList.add('spaced');
dialog.AddContent(separator_hr);

dialog.AddButton('Zapisz', () => {});
dialog.AddButton('Anuluj', dialog.Hide, ['secondary']);

dialog.Show();*/
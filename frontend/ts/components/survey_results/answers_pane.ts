import { SurveyResultsQuestion } from '../../entities/survey_results';
import Component from '../basic/component';

export default class AnswersPane extends Component {

    public constructor(question: SurveyResultsQuestion) {
        super();

        this.Element.classList.add('answers');

        let table = document.createElement('table');
        this.AppendChild(table);
        table.classList.add('table', 'full-width');

        let colgroup = document.createElement('colgroup');
        let col_shrink = document.createElement('col');
        col_shrink.classList.add('shrink');
        colgroup.appendChild(col_shrink);
        colgroup.appendChild(document.createElement('col'));
        colgroup.appendChild(document.createElement('col'));
        table.appendChild(colgroup);

        let head_tr = table.insertRow(-1);
        let ths = [];
        for(let i = 0; i < 3; i++) {
            ths[i] = document.createElement('th');
            head_tr.appendChild(ths[i]);
        }

        ths[1].textContent = 'Odpowiedź';
        ths[2].textContent = 'Ilość';

        for(let answer of question.ClosedAnswers) {
            let tr = table.insertRow(-1);

            let legend_td = tr.insertCell(-1);

            let text_td = tr.insertCell(-1);
            text_td.textContent = answer.Text;

            let answer_count = answer.AnswerCount;
            let percentage = Math.round(100 * (answer_count / question.AnswerCount));

            let percentage_td = tr.insertCell(-1);
            percentage_td.classList.add('center');
            percentage_td.textContent = answer_count.toString() + ' (' + percentage.toString() + '%)';
        }

        if(question.UserSuppliedAnswers.length > 0) {
            let other_tr = table.insertRow(-1);

            let others_legend_td = other_tr.insertCell(-1);

            let others_td = other_tr.insertCell(-1);
            others_td.textContent = 'Inne:';

            let others_count_td = other_tr.insertCell(-1);
            others_count_td.classList.add('center');
            others_count_td.style.verticalAlign = 'baseline';
            let others_count = question.UserSuppliedAnswers.length;
            let others_percentage = Math.round(100 * (others_count / question.AnswerCount));

            others_count_td.textContent = others_count.toString() + ' (' + others_percentage + '%)';

            let user_supplied_list = document.createElement('ul');
            others_td.appendChild(user_supplied_list);
            for(let us_answer of question.UserSuppliedAnswers) {
                let li = document.createElement('li');
                user_supplied_list.appendChild(li);

                li.textContent = us_answer;
            }
        }
    }
}
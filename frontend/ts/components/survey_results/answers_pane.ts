import { SurveyResultsQuestion } from '../../entities/survey_results';
import Component from '../basic/component';

export default class AnswersPane extends Component {

    public constructor(question: SurveyResultsQuestion, color_set: string[] = ['#f00']) {
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

        let closed_answers = question.ClosedAnswers.sort((a, b) => a.Order - b.Order);
        for(let i = 0; i < closed_answers.length; i++) {
            let answer = closed_answers[i];

            let tr = table.insertRow(-1);

            let legend_td = tr.insertCell(-1);
            let legend_square = document.createElement('span');
            legend_td.appendChild(legend_square);
            legend_square.classList.add('legend-square');
            legend_square.style.background = color_set[i % color_set.length];

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
            others_legend_td.style.verticalAlign = 'baseline';
            let others_legend_square = document.createElement('span');
            others_legend_td.appendChild(others_legend_square);
            others_legend_square.classList.add('legend-square');
            others_legend_square.style.background = color_set[closed_answers.length % color_set.length];

            let others_td = other_tr.insertCell(-1);
            others_td.textContent = 'Inne: ';

            let display_link = document.createElement('a');
            display_link.classList.add('small');
            display_link.textContent = '(Pokaż)';
            display_link.href = 'javascript:void(0)';
            others_td.appendChild(display_link);

            let hide_link = document.createElement('a');
            hide_link.classList.add('small');
            hide_link.style.display = 'none';
            hide_link.textContent = '(Ukryj)';
            hide_link.href = 'javascript:void(0)';
            others_td.appendChild(hide_link);

            let others_count_td = other_tr.insertCell(-1);
            others_count_td.classList.add('center');
            others_count_td.style.verticalAlign = 'baseline';
            let others_count = question.UserSuppliedAnswers.length;
            let others_percentage = Math.round(100 * (others_count / question.AnswerCount));

            others_count_td.textContent = others_count.toString() + ' (' + others_percentage + '%)';

            let user_supplied_list = document.createElement('ul');
            user_supplied_list.style.display = 'none';
            others_td.appendChild(user_supplied_list);
            for(let us_answer of question.UserSuppliedAnswers) {
                let li = document.createElement('li');
                user_supplied_list.appendChild(li);

                li.textContent = us_answer;
            }

            display_link.addEventListener('click', () => {
                display_link.style.display = 'none';
                hide_link.style.display = '';
                user_supplied_list.style.display = '';
            });

            hide_link.addEventListener('click', () => {
                display_link.style.display = '';
                hide_link.style.display = 'none';
                user_supplied_list.style.display = 'none';
            });
        }
    }
}
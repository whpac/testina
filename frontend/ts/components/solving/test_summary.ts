import Card from '../basic/card';
import { HandleLinkClick } from '../../script';
import QuestionWithUserAnswers from '../../entities/question_with_user_answers';
import Assignment from '../../entities/assignment';
import ScoreDetailsDialog from '../tests_lists/score_details_dialog';

export default class TestSummary extends Card {
    PercentageScoreNode: Text;
    AverageScoreSubtitle: HTMLSpanElement;
    AverageScoreLink: HTMLAnchorElement;
    AverageScoreNode: Text;
    ResultsTBody: HTMLTableSectionElement;

    constructor(){
        super();

        this.Element.classList.add('semi-wide');

        let score_header = document.createElement('h2');
        score_header.classList.add('center');
        score_header.innerText = 'Twój wynik: ';
        this.AppendChild(score_header);

        score_header.appendChild(this.PercentageScoreNode = document.createTextNode('0'));
        score_header.appendChild(document.createTextNode('%.'));

        this.AverageScoreSubtitle = document.createElement('span');
        this.AverageScoreSubtitle.classList.add('subtitle', 'center');
        this.AverageScoreSubtitle.innerText = 'Uśredniony wynik ze wszystkich podejść: ';
        this.AverageScoreSubtitle.style.display = 'none';
        this.AppendChild(this.AverageScoreSubtitle);

        this.AverageScoreLink = document.createElement('a');
        this.AverageScoreLink.appendChild(this.AverageScoreNode = document.createTextNode('0'));
        this.AverageScoreLink.appendChild(document.createTextNode('%'));
        this.AverageScoreSubtitle.appendChild(this.AverageScoreLink);
        this.AverageScoreSubtitle.appendChild(document.createTextNode('.'));

        let back_button_wrapper = document.createElement('div');
        back_button_wrapper.classList.add('center');
        this.AppendChild(back_button_wrapper);

        let back_button = document.createElement('a');
        back_button.classList.add('button', 'big', 'with-border');
        back_button.innerText = 'Wróć do listy testów';
        back_button.href = 'testy/lista';
        back_button.addEventListener('click', (e) => HandleLinkClick(e, 'testy/lista'));
        back_button_wrapper.appendChild(back_button);

        let result_table = document.createElement('table');
        result_table.classList.add('table', 'full-width');
        this.AppendChild(result_table);

        let heading_row = result_table.createTHead().insertRow(-1);
        let th_question = document.createElement('th');
        th_question.innerText = 'Pytanie';
        heading_row.appendChild(th_question);
        let th_points = document.createElement('th');
        th_points.innerText = 'Punkty';
        heading_row.appendChild(th_points);

        this.ResultsTBody = result_table.createTBody();
    }

    async Populate(questions: QuestionWithUserAnswers[], assignment: Assignment){
        this.AverageScoreLink.href = 'javascript:void(0)';
        this.AverageScoreLink.addEventListener('click', () => this.DisplayScoreDetailsDialog(assignment));

        this.DisplayParticularScores(questions);
        
        assignment.Reload();    // Żeby odświeżyć średni wynik
        let score = await assignment.GetScore();
        this.AverageScoreNode.textContent = score?.toString() ?? '0';
        this.AverageScoreSubtitle.style.display = '';
    }

    DisplayScoreDetailsDialog(assignment: Assignment){
        let dialog = new ScoreDetailsDialog();
        dialog.Populate(assignment);
        dialog.Show();
    }

    async DisplayParticularScores(questions: QuestionWithUserAnswers[]){
        let total_got = 0;
        let total_max = 0;

        let question_data = [];

        for(let question of questions){
            let q_got = await question.CountPoints();
            let q_max = await question.GetQuestion().GetPoints();

            total_got += q_got;
            total_max += q_max;

            let q_id = question.GetQuestion().GetId();
            if(question_data[q_id] === undefined){
                question_data[q_id] = {
                    text: await question.GetQuestion().GetText(),
                    got: 0,
                    max: 0
                }
            }

            question_data[q_id].got += q_got;
            question_data[q_id].max += q_max;
        }

        for(let question of question_data){
            if(question === undefined) continue;
            let row = this.ResultsTBody.insertRow(-1);
            row.insertCell(-1).textContent = question.text;

            let score_cell = row.insertCell(-1);
            score_cell.classList.add('center');
            score_cell.textContent = (Math.round(question.got * 100) / 100).toLocaleString() + '/' + question.max.toLocaleString();
        }

        this.PercentageScoreNode.textContent = Math.round(100 * total_got / total_max).toString();
    }
}
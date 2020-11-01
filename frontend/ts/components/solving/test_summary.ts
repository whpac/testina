import Card from '../basic/card';
import { HandleLinkClick } from '../../1page/page_manager';
import QuestionWithUserAnswers from '../../entities/question_with_user_answers';
import Assignment from '../../entities/assignment';
import ScoreDetailsDialog from '../tests_lists/score_details_dialog';
import AssignmentLoader from '../../entities/loaders/assignmentloader';

export default class TestSummary extends Card {
    PercentageScoreNode: Text;
    AverageScoreSubtitle: HTMLSpanElement;
    AverageScoreLink: HTMLAnchorElement;
    AverageScoreNode: Text;
    ResultsTable: HTMLTableElement;
    ResultsTBody: HTMLTableSectionElement;
    Assignment: Assignment | undefined;

    constructor() {
        super();

        this.Element.classList.add('semi-wide');

        let score_header = document.createElement('h2');
        score_header.classList.add('center');
        score_header.innerText = 'Twój wynik: ';
        this.AppendChild(score_header);

        score_header.appendChild(this.PercentageScoreNode = document.createTextNode('...'));
        score_header.appendChild(document.createTextNode('%.'));

        this.AverageScoreSubtitle = document.createElement('span');
        this.AverageScoreSubtitle.classList.add('subtitle', 'center');
        this.AverageScoreSubtitle.innerText = 'Końcowy wynik ze wszystkich podejść: ';
        this.AverageScoreSubtitle.style.display = 'none';
        this.AppendChild(this.AverageScoreSubtitle);

        this.AverageScoreLink = document.createElement('a');
        this.AverageScoreLink.href = 'javascript:void(0)';
        this.AverageScoreLink.addEventListener('click', this.DisplayScoreDetailsDialog.bind(this));
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

        this.ResultsTable = document.createElement('table');
        this.ResultsTable.classList.add('table', 'full-width');
        this.AppendChild(this.ResultsTable);

        let heading_row = this.ResultsTable.createTHead().insertRow(-1);
        let th_question = document.createElement('th');
        th_question.innerText = 'Pytanie';
        heading_row.appendChild(th_question);
        let th_points = document.createElement('th');
        th_points.innerText = 'Punkty';
        heading_row.appendChild(th_points);

        this.ResultsTBody = this.ResultsTable.createTBody();
    }

    async Populate(questions: QuestionWithUserAnswers[], assignment: Assignment) {
        // Przypisanie jest wczytywane ponownie, by odświeżyć wynik
        let assignment_awaiter = AssignmentLoader.LoadById(assignment.Id);
        this.Assignment = assignment;

        if(!this.Assignment.Test.DoHideCorrectAnswers) {
            this.DisplayParticularScores(questions);
            this.ResultsTable.style.display = '';
        } else {
            this.ResultsTable.style.display = 'none';
        }

        assignment.Score = (await assignment_awaiter).Score;
        let score = assignment.Score;
        this.AverageScoreNode.textContent = score?.toString() ?? '0';
        this.AverageScoreSubtitle.style.display = '';

        let attempts = await assignment.GetAttemptsForCurrentUser();
        let current_attempt = attempts[attempts.length - 1];
        let current_score = 0;
        if(current_attempt.MaxScore != 0) current_score = 100 * (current_attempt.Score ?? 0) / current_attempt.MaxScore;
        this.PercentageScoreNode.textContent = Math.round(current_score).toString();
    }

    DisplayScoreDetailsDialog() {
        if(this.Assignment === undefined) return;

        let dialog = new ScoreDetailsDialog();
        dialog.Populate(this.Assignment);
        dialog.Show();
    }

    async DisplayParticularScores(questions: QuestionWithUserAnswers[]) {
        let total_got = 0;
        let total_max = 0;

        let question_data = [];

        for(let question of questions) {
            let q_got = question.CountPoints();
            let q_max = question.GetQuestion().Points;

            total_got += q_got;
            total_max += q_max;

            let q_id = question.GetQuestion().Id;
            if(question_data[q_id] === undefined) {
                question_data[q_id] = {
                    text: question.GetQuestion().Text,
                    got: 0,
                    max: 0
                };
            }

            question_data[q_id].got += q_got;
            question_data[q_id].max += q_max;
        }

        this.ResultsTBody.textContent = '';
        for(let question of question_data) {
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
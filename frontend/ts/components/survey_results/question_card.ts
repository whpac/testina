import { SurveyResultsQuestion } from '../../entities/survey_results';
import Card from '../basic/card';
import AnswersPane from './answers_pane';
import BarGraph from './bar_graph';

export default class QuestionCard extends Card {

    public constructor(question: SurveyResultsQuestion) {
        super();

        let heading = document.createElement('h2');
        heading.textContent = question.Text;
        this.AppendChild(heading);

        let answers_graph_wrapper = document.createElement('div');
        answers_graph_wrapper.classList.add('answers-graph-wrapper');
        this.AppendChild(answers_graph_wrapper);

        let answers = new AnswersPane(question);
        answers_graph_wrapper.appendChild(answers.GetElement());

        let graph = new BarGraph();
        answers_graph_wrapper.appendChild(graph.GetElement());
    }
}
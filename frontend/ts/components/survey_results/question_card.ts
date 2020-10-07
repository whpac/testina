import { SurveyResultsQuestion } from '../../entities/survey_results';
import { Truncate } from '../../utils/textutils';
import Card from '../basic/card';
import BarGraph, { GraphAnswerDescriptor } from '../basic/graphs/bar_graph';
import AnswersPane from './answers_pane';

export default class QuestionCard extends Card {

    public constructor(question: SurveyResultsQuestion) {
        super('semi-wide');

        let heading = document.createElement('h2');
        heading.textContent = question.Text;
        this.AppendChild(heading);

        let answers_graph_wrapper = document.createElement('div');
        answers_graph_wrapper.classList.add('answers-graph-wrapper');
        this.AppendChild(answers_graph_wrapper);

        let answers = new AnswersPane(question, BarGraph.DEFAULT_COLOR_SET);
        answers_graph_wrapper.appendChild(answers.GetElement());

        let data_points: GraphAnswerDescriptor[] = [];
        for(let i = 0; i < question.ClosedAnswers.length; i++) {
            let answer = question.ClosedAnswers[i];

            data_points.push({
                Value: answer.AnswerCount,
                Label: Truncate(answer.Text, 15),
                Color: BarGraph.DEFAULT_COLOR_SET[i % BarGraph.DEFAULT_COLOR_SET.length]
            });
        }

        if(question.UserSuppliedAnswers.length > 0) {
            data_points.push({
                Value: question.UserSuppliedAnswers.length,
                Label: 'Inne',
                Color: BarGraph.DEFAULT_COLOR_SET[question.ClosedAnswers.length % BarGraph.DEFAULT_COLOR_SET.length]
            });
        }

        let graph = new BarGraph();
        answers_graph_wrapper.appendChild(graph.GetElement());
        graph.Populate(data_points);
    }
}
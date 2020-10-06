import { GoToPage } from '../1page/page_manager';
import Icon from '../components/basic/icon';
import Page from '../components/basic/page';
import Toast from '../components/basic/toast';
import NoAnswersYet from '../components/survey_results/no_answers_yet';
import QuestionCard from '../components/survey_results/question_card';
import SurveyLoader from '../entities/loaders/surveyloader';
import SurveyResultsLoader from '../entities/loaders/surveyresultsloader';
import Test from '../entities/test';

export default class SurveyResultsPage extends Page {
    protected Survey: Test | undefined;
    protected SurveyNameHeadingText: Text;
    protected QuestionsWrapper: HTMLElement;

    constructor() {
        super();

        let btn_wrapper = document.createElement('div');
        btn_wrapper.classList.add('fixed-buttons-wrapper');
        this.AppendChild(btn_wrapper);

        let close_btn = document.createElement('button');
        close_btn.classList.add('header-button');
        close_btn.appendChild(new Icon('times').GetElement());
        close_btn.appendChild(document.createTextNode('Zamknij'));
        close_btn.addEventListener('click', () => GoToPage('ankiety'));
        btn_wrapper.appendChild(close_btn);

        let heading = document.createElement('h1');
        this.AppendChild(heading);

        this.SurveyNameHeadingText = document.createTextNode('');
        heading.appendChild(this.SurveyNameHeadingText);

        let results_text = document.createElement('span');
        heading.appendChild(results_text);
        results_text.textContent = ' – wyniki';
        results_text.classList.add('secondary');

        this.QuestionsWrapper = document.createElement('div');
        this.AppendChild(this.QuestionsWrapper);
    }

    async LoadInto(container: HTMLElement, params?: any) {
        try {
            if(typeof params === 'number' || typeof params === 'string') this.Survey = await SurveyLoader.LoadById(parseInt(params.toString()));
            else this.Survey = params as Test;

            this.SurveyNameHeadingText.textContent = this.Survey.Name;
            this.QuestionsWrapper.textContent = '';

            let results = await SurveyResultsLoader.Load(this.Survey);
            if(results.Questions.length == 0) {
                this.QuestionsWrapper.appendChild(new NoAnswersYet().GetElement());
            } else {
                for(let question of results.Questions) {
                    let q_card = new QuestionCard(question);
                    this.QuestionsWrapper.appendChild(q_card.GetElement());
                }
            }

            container.appendChild(this.Element);
        } catch(e) {
            let message = '.';
            if('Message' in e) message = ': ' + e.Message;

            new Toast('Nie udało się wczytać ankiety' + message).Show(0);
        }
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return 'ankiety/wyniki/' + (this.Survey?.Id ?? '0');
    }

    GetTitle() {
        return (this.Survey?.Name ?? '') + ' – wyniki';
    }
}
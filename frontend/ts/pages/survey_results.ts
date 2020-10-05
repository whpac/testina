import Page from '../components/basic/page';
import Toast from '../components/basic/toast';
import QuestionCard from '../components/survey_results/question_card';
import SurveyLoader from '../entities/loaders/surveyloader';
import SurveyResultsLoader from '../entities/loaders/surveyresultsloader';
import Test from '../entities/test';

export default class SurveyResultsPage extends Page {
    protected Survey: Test | undefined;
    protected SurveyNameHeadingText: Text;

    constructor() {
        super();

        let heading = document.createElement('h1');
        this.AppendChild(heading);

        this.SurveyNameHeadingText = document.createTextNode('');
        heading.appendChild(this.SurveyNameHeadingText);

        let results_text = document.createElement('span');
        heading.appendChild(results_text);
        results_text.textContent = ' – wyniki';
        results_text.classList.add('secondary');
    }

    async LoadInto(container: HTMLElement, params?: any) {
        try {
            if(typeof params === 'number' || typeof params === 'string') this.Survey = await SurveyLoader.LoadById(parseInt(params.toString()));
            else this.Survey = params as Test;

            this.SurveyNameHeadingText.textContent = this.Survey.Name;

            let results = await SurveyResultsLoader.Load(this.Survey);
            for(let question of results.Questions) {
                let q_card = new QuestionCard(question);
                this.AppendChild(q_card);
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
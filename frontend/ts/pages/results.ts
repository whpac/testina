import Page from '../components/basic/page';
import Assignment from '../entities/assignment';
import AssignmentLoader from '../entities/loaders/assignmentloader';
import ResultsCard from '../components/results/results_card';
import { GoToPage } from '../1page/page_manager';
import Toast from '../components/basic/toast';

export default class ResultsPage extends Page {
    protected Assignment: Assignment | undefined;
    protected TestNameHeading: Text;
    protected ResultsCard: ResultsCard;

    constructor() {
        super();

        let buttons_wrapper = document.createElement('div');
        buttons_wrapper.classList.add('fixed-buttons-wrapper');
        this.AppendChild(buttons_wrapper);

        let close_button = document.createElement('button');
        close_button.classList.add('button', 'header-button');
        close_button.innerHTML = '<i class="fa fa-times icon"></i><span>Zamknij</span>';
        close_button.addEventListener('click', () => GoToPage('testy/przypisane', this.Assignment?.Test));
        buttons_wrapper.appendChild(close_button);

        let page_heading = document.createElement('h1');
        this.AppendChild(page_heading);
        page_heading.appendChild(this.TestNameHeading = document.createTextNode(''));

        let span_secondary = document.createElement('span');
        span_secondary.classList.add('secondary');
        span_secondary.textContent = ' – wyniki';
        page_heading.appendChild(span_secondary);

        this.ResultsCard = new ResultsCard();
        this.AppendChild(this.ResultsCard);
    }

    async LoadInto(container: HTMLElement, params?: any) {
        try {
            if(params === undefined) throw 'Nie podano testu, dla którego mają być wyświetlone wyniki.';
            if(typeof params === 'string') this.Assignment = await AssignmentLoader.LoadById(params);
            else this.Assignment = params as Assignment;

            this.TestNameHeading.textContent = this.Assignment.Test.Name;
            container.appendChild(this.Element);
            this.ResultsCard.Populate(this.Assignment);
        } catch(e) {
            let message = '.';
            if('Message' in e) message = ': ' + e.Message;

            new Toast('Nie udało się wczytać wyników' + message).Show(0);
        }
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return 'testy/wyniki/' + (this.Assignment?.Id.toString() ?? '0');
    }

    GetTitle() {
        return this.Assignment?.Test.Name + ' – wyniki';
    }

}
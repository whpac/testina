import Page from '../components/basic/page';
import Assignment from '../entities/assignment';
import AssignmentLoader from '../entities/loaders/assignmentloader';

export default class ResultsPage extends Page{
    protected Assignment: Assignment | undefined;
    protected TestNameHeading: Text;

    constructor(){
        super();

        let page_heading = document.createElement('h1');
        this.AppendChild(page_heading);
        page_heading.appendChild(this.TestNameHeading = document.createTextNode(''));

        let span_secondary = document.createElement('span');
        span_secondary.classList.add('secondary');
        span_secondary.textContent = ' – wyniki';
        page_heading.appendChild(span_secondary);
    }

    async LoadInto(container: HTMLElement, params?: any) {
        if(params === undefined) throw 'Nie podano testu, dla którego mają być wyświetlone wyniki.';
        if(typeof params === 'number') this.Assignment = await AssignmentLoader.LoadById(params);
        else this.Assignment = params as Assignment;

        this.TestNameHeading.textContent = this.Assignment.Test.Name;
        container.appendChild(this.Element);
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return 'testy/wyniki/' + this.Assignment?.Id.toString() ?? '0';
    }

    async GetTitle() {
        return this.Assignment?.Test.Name + ' – wyniki';
    }
    
}
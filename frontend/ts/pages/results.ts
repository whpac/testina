import Page from '../components/basic/page';
import Assignment from '../entities/assignment';
import AssignmentLoader from '../entities/loaders/assignmentloader';

export default class ResultsPage extends Page{
    protected Assignment: Assignment | undefined;

    async LoadInto(container: HTMLElement, params?: any) {
        if(params === undefined) throw 'Nie podano testu, dla którego mają być wyświetlone wyniki.';
        if(typeof params === 'number') this.Assignment = await AssignmentLoader.LoadById(params);
        else this.Assignment = params as Assignment;
        
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
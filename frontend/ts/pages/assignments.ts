import Page from '../components/basic/page';
import Test from '../entities/test';
import AssignmentsCard from '../components/assignments/assignments_card';
import TestLoader from '../entities/loaders/testloader';

export default class AssignmentsPage extends Page {
    protected Test: Test | undefined;
    protected TestNameHeading: Text;
    protected AssignmentsCard: AssignmentsCard;

    constructor(){
        super();

        let page_heading = document.createElement('h1');
        this.Element.appendChild(page_heading);
        page_heading.appendChild(this.TestNameHeading = document.createTextNode(''));

        let span_secondary = document.createElement('span');
        span_secondary.classList.add('secondary');
        span_secondary.textContent = ' – przypisania';
        page_heading.appendChild(span_secondary);

        this.AssignmentsCard = new AssignmentsCard();
        this.AppendChild(this.AssignmentsCard);
    }

    async LoadInto(container: HTMLElement, params?: any){
        if(typeof params === 'number') this.Test = await TestLoader.LoadById(params);
        else this.Test = params as Test;
        this.TestNameHeading.textContent = this.Test.Name;

        this.AssignmentsCard.Populate(this.Test);

        container.appendChild(this.Element);
    }

    UnloadFrom(container: HTMLElement){
        container.removeChild(this.Element);
    }

    GetUrlPath(){
        return 'testy/przypisane/' + this.Test?.Id.toString() ?? '0';
    }

    async GetTitle(){
        return (this.Test?.Name ?? '') + ' – przypisania';
    }
}
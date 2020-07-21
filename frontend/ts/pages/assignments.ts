import Page from '../components/basic/page';
import Test from '../entities/test';
import AssignmentsCard from '../components/assignments/assignments_card';

export default class AssignmentsPage extends Page {
    protected Test: Test | undefined;
    protected TestNameHeading: Text;

    constructor(){
        super();

        let page_heading = document.createElement('h1');
        this.Element.appendChild(page_heading);
        page_heading.appendChild(this.TestNameHeading = document.createTextNode(''));

        let span_secondary = document.createElement('span');
        span_secondary.classList.add('secondary');
        span_secondary.textContent = ' – przypisania';
        page_heading.appendChild(span_secondary);

        let assignments_card = new AssignmentsCard();
        this.AppendChild(assignments_card);
    }

    async LoadInto(container: HTMLElement, params?: any){
        if(typeof params === 'number') this.Test = new Test(params);
        else this.Test = params as Test;
        this.TestNameHeading.textContent = await this.Test.GetName();

        container.appendChild(this.Element);
    }

    UnloadFrom(container: HTMLElement){
        container.removeChild(this.Element);
    }

    GetUrlPath(){
        return 'testy/przypisane/' + this.Test?.GetId().toString() ?? '0';
    }

    async GetTitle(){
        return (await this.Test?.GetName() ?? '') + ' – przypisania';
    }
}
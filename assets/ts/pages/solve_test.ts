import Page from '../1page/page';
import Assignment from '../entities/assignment';
import PageParams from '../1page/pageparams';
import TestInvitationCard from '../components/test_invitation_card';

export default class SolveTestPage extends Page{
    PageElem: HTMLElement;
    HeadingTestName: Text;
    Invitation: TestInvitationCard;
    Assignment: Assignment | undefined;

    constructor(){
        super();

        this.PageElem = document.createElement('div');

        let heading = document.createElement('h1');

        let heading_prefix = document.createElement('span');
        heading_prefix.classList.add('secondary');
        heading_prefix.textContent = 'Rozwiąż: ';
        heading.appendChild(heading_prefix);

        this.HeadingTestName = document.createTextNode('');
        heading.appendChild(this.HeadingTestName);
        this.PageElem.appendChild(heading);

        this.Invitation = new TestInvitationCard();
        this.PageElem.appendChild(this.Invitation.GetElement());
    }

    async LoadInto(container: HTMLElement, params?: PageParams){
        if(params === undefined) throw 'Nie podano testu do rozwiązania';
        this.Assignment = params as Assignment;

        container.appendChild(this.PageElem);
        this.HeadingTestName.textContent = await (await this.Assignment.GetTest()).GetName();
        this.Invitation.Populate(this.Assignment);
    }

    UnloadFrom(container: HTMLElement){
        container.removeChild(this.PageElem);
    }

    GetUrlPath(){
        return 'testy/rozwiąż/' + (this.Assignment?.GetId().toString() ?? '');
    }

    async GetTitle(){
        if(this.Assignment === undefined) return 'Rozwiąż test';
        return 'Rozwiąż: ' + await (await this.Assignment?.GetTest()).GetName();
    }
}
import Page from '../1page/page';
import Assignment from '../entities/assignment';
import PageParams from '../1page/pageparams';
import TestInvitationCard from '../components/test_invitation_card';
import QuestionCard from '../components/question_card';
import Attempt from '../entities/attempt';

export default class SolveTestPage extends Page{
    PageElem: HTMLElement;
    HeadingTestName: Text;
    Invitation: TestInvitationCard;
    QuestionCard: QuestionCard;
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
        this.Invitation.OnTestLoaded = this.OnTestLoaded.bind(this);
        this.PageElem.appendChild(this.Invitation.GetElement());

        this.QuestionCard = new QuestionCard();
        this.QuestionCard.GetElement().style.display = 'none';
        this.PageElem.appendChild(this.QuestionCard.GetElement());
    }

    protected OnTestLoaded(attempt: Attempt){
        this.Invitation.GetElement().style.display = 'none';
        this.QuestionCard.GetElement().style.display = '';
        this.QuestionCard.StartTest(attempt);
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
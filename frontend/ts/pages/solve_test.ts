import Page from '../components/basic/page';
import Assignment from '../entities/assignment';
import PageParams from '../1page/pageparams';
import TestInvitationCard from '../components/solving/test_invitation_card';
import QuestionCard from '../components/solving/question_card';
import Attempt from '../entities/attempt';
import QuestionWithUserAnswers from '../entities/question_with_user_answers';
import TestSummary from '../components/solving/test_summary';
import AssignmentLoader from '../entities/loaders/assignmentloader';

export default class SolveTestPage extends Page{
    HeadingTestName: Text;
    Invitation: TestInvitationCard;
    QuestionCard: QuestionCard;
    TestSummary: TestSummary;
    Assignment: Assignment | undefined;

    constructor(){
        super();

        let heading = document.createElement('h1');

        let heading_prefix = document.createElement('span');
        heading_prefix.classList.add('secondary');
        heading_prefix.textContent = 'Rozwiąż: ';
        heading.appendChild(heading_prefix);

        this.HeadingTestName = document.createTextNode('');
        heading.appendChild(this.HeadingTestName);
        this.Element.appendChild(heading);

        this.Invitation = new TestInvitationCard();
        this.Invitation.OnTestLoaded = this.OnTestLoaded.bind(this);
        this.Element.appendChild(this.Invitation.GetElement());

        this.QuestionCard = new QuestionCard();
        this.Element.appendChild(this.QuestionCard.GetElement());

        this.TestSummary = new TestSummary();
        this.Element.appendChild(this.TestSummary.GetElement());
    }

    protected OnTestLoaded(attempt: Attempt){
        this.Invitation.GetElement().style.display = 'none';
        this.QuestionCard.GetElement().style.display = '';
        this.QuestionCard.OnTestFinished = this.OnTestFinished.bind(this);
        this.QuestionCard.StartTest(attempt);
    }

    protected OnTestFinished(questions: QuestionWithUserAnswers[]){
        if(this.Assignment === undefined){
            alert('Nie udało się wyświetlić strony z podsumowaniem.\nPomimo tego, wyniki zostały zapisane.');
            throw 'SolveTest.Assignment === undefined';
        }
        
        this.QuestionCard.GetElement().style.display = 'none';
        this.TestSummary.GetElement().style.display = '';
        this.TestSummary.Populate(questions, this.Assignment);
    }

    async LoadInto(container: HTMLElement, params?: PageParams){
        if(params === undefined) throw 'Nie podano testu do rozwiązania';
        if(typeof params === 'number') this.Assignment = await AssignmentLoader.LoadById(params);
        else this.Assignment = params as Assignment;

        this.Invitation.GetElement().style.display = '';
        this.QuestionCard.GetElement().style.display = 'none';
        this.TestSummary.GetElement().style.display = 'none';

        container.appendChild(this.Element);
        this.HeadingTestName.textContent = this.Assignment.Test.Name;
        this.Invitation.Populate(this.Assignment);
    }

    UnloadFrom(container: HTMLElement){
        container.removeChild(this.Element);
    }

    GetUrlPath(){
        return 'testy/rozwiąż/' + (this.Assignment?.Id.toString() ?? '');
    }

    async GetTitle(){
        if(this.Assignment === undefined) return 'Rozwiąż test';
        return 'Rozwiąż: ' + this.Assignment?.Test.Name;
    }
}
import Page from '../components/basic/page';
import Test from '../entities/test';
import SurveyLoader from '../entities/loaders/surveyloader';
import SurveyIntroduction from '../components/surveys/survey_introduction';
import SurveyQuestionCard from '../components/surveys/survey_question_card';
import Icon from '../components/basic/icon';
import { MoveElement } from '../utils/arrayutils';
import Question from '../entities/question';

export default class EditSurveyPage extends Page {
    protected Survey: Test | undefined;
    protected SurveyNameHeading: Text;
    protected IntroductionCard: SurveyIntroduction;
    protected QuestionCards: SurveyQuestionCard[];

    public constructor() {
        super();

        this.QuestionCards = [];

        let heading = document.createElement('h1');
        this.AppendChild(heading);
        let edit_text = document.createElement('span');
        heading.appendChild(edit_text);
        edit_text.classList.add('secondary');
        edit_text.textContent = 'Edytuj: ';

        this.SurveyNameHeading = document.createTextNode('');
        heading.appendChild(this.SurveyNameHeading);

        this.IntroductionCard = new SurveyIntroduction(true);
        this.AppendChild(this.IntroductionCard);
    }

    async LoadInto(container: HTMLElement, params?: any) {
        if(typeof params === 'number') this.Survey = await SurveyLoader.LoadById(params);
        else this.Survey = params as Test;

        this.SurveyNameHeading.textContent = this.Survey.Name;
        this.IntroductionCard.Populate(this.Survey);

        let questions = await this.Survey.GetQuestions();
        for(let i = 0; i < questions.length; i++) {
            this.RenderQuestion(questions[i], i + 1);
        }
        this.RefreshQuestionOrder();

        let new_question_btn_wrapper = document.createElement('div');
        new_question_btn_wrapper.classList.add('center');
        this.AppendChild(new_question_btn_wrapper);

        let new_question_btn = document.createElement('button');
        new_question_btn.appendChild(new Icon('plus').GetElement());
        new_question_btn.appendChild(document.createTextNode(' Dodaj pytanie'));
        new_question_btn_wrapper.appendChild(new_question_btn);

        container.appendChild(this.Element);
    }

    UnloadFrom(container: HTMLElement) {
        container.removeChild(this.Element);
    }

    GetUrlPath() {
        return 'ankiety/edytuj/' + (this.Survey?.Id ?? 0);
    }

    async GetTitle() {
        return 'Edytuj: ' + this.Survey?.Name;
    }

    protected RenderQuestion(question: Question, question_number: number) {
        let question_card = new SurveyQuestionCard(true);
        this.AppendChild(question_card);
        question_card.Populate(question, question_number);
        this.QuestionCards.push(question_card);
        question_card.AddEventListener('moveup', (() => this.OnQuestionMovedUp(question_card)).bind(this));
        question_card.AddEventListener('movedown', (() => this.OnQuestionMovedDown(question_card)).bind(this));

        if(this.QuestionCards.length >= 2) {
            let prev = this.QuestionCards[this.QuestionCards.length - 2];
            prev.NextCard = question_card;
            question_card.PreviousCard = prev;
        }
    }

    protected RefreshQuestionOrder() {
        for(let i = 0; i < this.QuestionCards.length; i++) {
            this.QuestionCards[i].IsFirst = (i == 0);
            this.QuestionCards[i].IsLast = (i == this.QuestionCards.length - 1);
            this.QuestionCards[i].SetNumber(i + 1);
        }
    }

    protected OnQuestionMovedUp(question_card: SurveyQuestionCard) {
        if(question_card.PreviousCard === null) return;

        let former_prev = question_card.PreviousCard;
        let new_prev = former_prev.PreviousCard;
        let former_next = question_card.NextCard;

        if(new_prev !== null) new_prev.NextCard = question_card;
        former_prev.PreviousCard = question_card;
        former_prev.NextCard = former_next;
        question_card.PreviousCard = new_prev;
        question_card.NextCard = former_prev;
        if(former_next !== null) former_next.PreviousCard = former_prev;

        for(let i = 0; i < this.QuestionCards.length; i++) {
            if(question_card == this.QuestionCards[i]) {
                MoveElement(this.QuestionCards, i, i - 1);
                break;
            }
        }

        this.RefreshQuestionOrder();
    }

    protected OnQuestionMovedDown(question_card: SurveyQuestionCard) {
        if(question_card.NextCard === null) return;

        let former_prev = question_card.PreviousCard;
        let former_next = question_card.NextCard;
        let new_next = former_next.NextCard;

        if(former_prev !== null) former_prev.NextCard = former_next;
        question_card.PreviousCard = former_next;
        question_card.NextCard = new_next;
        former_next.PreviousCard = former_prev;
        former_next.NextCard = question_card;
        if(new_next !== null) new_next.PreviousCard = question_card;

        for(let i = 0; i < this.QuestionCards.length; i++) {
            if(question_card == this.QuestionCards[i]) {
                MoveElement(this.QuestionCards, i, i + 1);
                break;
            }
        }

        this.RefreshQuestionOrder();
    }
}
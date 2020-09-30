import Page from '../components/basic/page';
import Test from '../entities/test';
import SurveyLoader from '../entities/loaders/surveyloader';
import SurveyIntroduction from '../components/surveys/survey_introduction';
import SurveyQuestionCard from '../components/surveys/survey_question_card';
import Icon from '../components/basic/icon';
import { MoveElement } from '../utils/arrayutils';
import Question from '../entities/question';
import NavigationPrevention from '../1page/navigation_prevention';
import Toast from '../components/basic/toast';
import ChromeManager from '../1page/chrome_manager';
import { GoToPage } from '../1page/page_manager';

export default class EditSurveyPage extends Page {
    protected Survey: Test | undefined;
    protected SurveyNameHeading: Text;
    protected IntroductionCard: SurveyIntroduction;
    protected QuestionWrapper: HTMLElement;
    protected QuestionCards: SurveyQuestionCard[];

    public constructor() {
        super();

        this.QuestionCards = [];

        let btn_wrapper = document.createElement('div');
        btn_wrapper.classList.add('fixed-buttons-wrapper');
        this.AppendChild(btn_wrapper);

        let save_btn = document.createElement('button');
        save_btn.classList.add('header-button');
        save_btn.appendChild(new Icon('save').GetElement());
        save_btn.appendChild(document.createTextNode(' Zapisz'));
        save_btn.addEventListener('click', this.Save.bind(this));
        btn_wrapper.appendChild(save_btn);

        let close_btn = document.createElement('button');
        close_btn.classList.add('header-button');
        close_btn.appendChild(new Icon('times').GetElement());
        close_btn.appendChild(document.createTextNode('Zamknij'));
        close_btn.addEventListener('click', () => GoToPage('ankiety'));
        btn_wrapper.appendChild(close_btn);

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

        this.QuestionWrapper = document.createElement('div');
        this.AppendChild(this.QuestionWrapper);

        let new_question_btn_wrapper = document.createElement('div');
        new_question_btn_wrapper.classList.add('center');
        this.AppendChild(new_question_btn_wrapper);

        let new_question_btn = document.createElement('button');
        new_question_btn.appendChild(new Icon('plus').GetElement());
        new_question_btn.appendChild(document.createTextNode(' Dodaj pytanie'));
        new_question_btn.addEventListener('click', this.OnAddQuestionClick.bind(this));
        new_question_btn_wrapper.appendChild(new_question_btn);
    }

    async LoadInto(container: HTMLElement, params?: any) {
        try {
            if(typeof params === 'string') this.Survey = await SurveyLoader.LoadById(parseInt(params));
            else this.Survey = params as Test;

            this.QuestionCards = [];
            this.QuestionWrapper.textContent = '';

            this.SurveyNameHeading.textContent = this.Survey.Name;
            this.IntroductionCard.Populate(this.Survey);

            let questions = await this.Survey.GetQuestions();
            questions.sort((a, b) => a.Order - b.Order);
            for(let i = 0; i < questions.length; i++) {
                this.RenderQuestion(questions[i], i + 1);
            }
            this.RefreshQuestionOrder();

            container.appendChild(this.Element);
            ChromeManager.MobileHeader.AddButton(new Icon('save'), this.Save.bind(this), 'Zapisz');

            this.Survey.AddEventListener('change', () => {
                this.SurveyNameHeading.textContent = this.Survey?.Name ?? '';
                ChromeManager.SetTitle(this.GetTitle());
            });
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
        return 'ankiety/edytuj/' + (this.Survey?.Id ?? 0);
    }

    GetTitle() {
        return 'Edytuj: ' + (this.Survey?.Name ?? '');
    }

    protected RenderQuestion(question: Question | undefined, question_number: number) {
        let question_card = new SurveyQuestionCard(true);
        this.QuestionWrapper.appendChild(question_card.GetElement());
        question_card.Populate(question, question_number);
        if(this.Survey !== undefined) question_card.SetSurvey(this.Survey);
        this.QuestionCards.push(question_card);
        question_card.AddEventListener('moveup', (() => this.OnQuestionMovedUp(question_card)).bind(this));
        question_card.AddEventListener('movedown', (() => this.OnQuestionMovedDown(question_card)).bind(this));
        question_card.AddEventListener('markasdeleted', this.RefreshQuestionOrder.bind(this));
        question_card.AddEventListener('markasundeleted', this.RefreshQuestionOrder.bind(this));

        if(this.QuestionCards.length >= 2) {
            let prev = this.QuestionCards[this.QuestionCards.length - 2];
            prev.NextCard = question_card;
            question_card.PreviousCard = prev;
        }
    }

    protected RefreshQuestionOrder() {
        let q_number = 1;
        for(let card of this.QuestionCards) {
            card.IsFirst = card.IsLast = false;
            if(card.IsDeleted) continue;
            card.SetNumber(q_number);
            q_number++;
        }

        for(let i = 0; i < this.QuestionCards.length; i++) {
            if(this.QuestionCards[i].IsDeleted) continue;
            this.QuestionCards[i].IsFirst = true;
            break;
        }

        for(let i = this.QuestionCards.length - 1; i >= 0; i--) {
            if(this.QuestionCards[i].IsDeleted) continue;
            this.QuestionCards[i].IsLast = true;
            break;
        }
    }

    protected OnAddQuestionClick() {
        this.RenderQuestion(undefined, this.QuestionCards.length + 1);
        this.RefreshQuestionOrder();
        NavigationPrevention.Prevent('survey-editor');
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
        NavigationPrevention.Prevent('survey-editor');
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
        NavigationPrevention.Prevent('survey-editor');
    }

    protected async Save() {
        let saving_toast = new Toast('Zapisywanie...');
        saving_toast.Show();
        let order = 0;

        try {
            this.IntroductionCard.Save();

            let question_awaiters: Promise<void>[] = [];
            for(let question_card of this.QuestionCards) {
                if(!question_card.IsDeleted) order++;
                question_awaiters.push(question_card.Save(order));
            }
            for(let awaiter of question_awaiters) await awaiter;

            saving_toast.Hide();
            new Toast('Zapisano.').Show(0);
            NavigationPrevention.Unprevent('survey-editor');
        } catch(e) {
            let message = '.';
            if('Message' in e) {
                message = ': ' + e.Message;
            }

            saving_toast.Hide();
            new Toast('Nie udało się zapisać' + message).Show(0);
        }
    }
}
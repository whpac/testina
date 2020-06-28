import Card from './card'
import Question from '../entities/question';

export default class QuestionCard extends Card {
    protected CurrentQuestionNumber: Text;
    protected TotalQuestionNumber: Text;
    protected CurrentScore: Text;
    protected TimeLeftTimer: Text;
    protected QuestionText: HTMLHeadingElement;
    protected AnswerWrapper: HTMLDivElement;
    protected DoneButton: HTMLButtonElement;
    protected NextButton: HTMLButtonElement;
    protected FinishButton: HTMLButtonElement;

    constructor(){
        super();

        this.Element.classList.add('semi-wide');

        let q_metadata = document.createElement('div');
        q_metadata.classList.add('question-metadata');
        this.AppendChild(q_metadata);

        let q_number = document.createElement('span');
        q_number.classList.add('question-count');
        q_number.appendChild(this.CurrentQuestionNumber = document.createTextNode('0'));
        q_number.appendChild(document.createTextNode('/'));
        q_number.appendChild(this.TotalQuestionNumber = document.createTextNode('0'));
        q_metadata.appendChild(q_number);

        let q_score = document.createElement('span');
        q_score.classList.add('question-score');
        q_score.appendChild(this.CurrentScore = document.createTextNode('0'));
        q_score.appendChild(document.createTextNode('%'));
        q_metadata.appendChild(q_score);

        let q_timer = document.createElement('span');
        q_timer.classList.add('question-timer');
        q_metadata.appendChild(q_timer);

        let q_timer_icon = document.createElement('i');
        q_timer_icon.classList.add('fa', 'fa-clock-o', 'icon');
        q_timer.appendChild(q_timer_icon);
        q_timer.appendChild(document.createTextNode(' '));
        q_timer.appendChild(this.TimeLeftTimer = document.createTextNode('0:00'));

        this.QuestionText = document.createElement('h2');
        this.QuestionText.classList.add('question-text');
        this.QuestionText.textContent = 'Treść pytania';
        this.AppendChild(this.QuestionText);

        this.AnswerWrapper = document.createElement('div');
        this.AnswerWrapper.classList.add('question-answer-buttons');
        this.AppendChild(this.AnswerWrapper);

        let ans1 = document.createElement('button');
        ans1.classList.add('answer-button');
        ans1.textContent = 'A';
        this.AnswerWrapper.appendChild(ans1);
        
        let ans2 = document.createElement('button');
        ans2.classList.add('answer-button');
        ans2.textContent = 'B';
        this.AnswerWrapper.appendChild(ans2);

        this.DoneButton = document.createElement('button');
        this.DoneButton.classList.add('big', 'with-border');
        this.DoneButton.textContent = 'Gotowe';
        this.AddButton(this.DoneButton);

        this.NextButton = document.createElement('button');
        this.NextButton.classList.add('big', 'with-border');
        this.NextButton.textContent = 'Następne pytanie';
        this.AddButton(this.NextButton);

        this.FinishButton = document.createElement('button');
        this.FinishButton.classList.add('big', 'with-border');
        this.FinishButton.textContent = 'Zakończ test';
        this.AddButton(this.FinishButton);
    }

    async Populate(question: Question){
        this.QuestionText.textContent = await question.GetText();

        this.AnswerWrapper.textContent = '';
        

        this.DoneButton.style.display = '';
        this.NextButton.style.display = 'none';
        this.FinishButton.style.display = 'none';
    }
}
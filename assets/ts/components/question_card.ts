import Card from './card'

export default class QuestionCard extends Card {
    protected CurrentQuestionNumber: Text;
    protected TotalQuestionNumber: Text;
    protected CurrentScore: Text;
    protected TimeLeftTimer: Text;
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

        let q_text = document.createElement('h2');
        q_text.classList.add('question-text');
        q_text.textContent = 'Treść pytania';
        this.AppendChild(q_text);

        let answers_wrapper = document.createElement('div');
        answers_wrapper.classList.add('question-answer-buttons');
        this.AppendChild(answers_wrapper);

        let ans1 = document.createElement('button');
        ans1.classList.add('answer-button');
        ans1.textContent = 'A';
        answers_wrapper.appendChild(ans1);
        
        let ans2 = document.createElement('button');
        ans2.classList.add('answer-button');
        ans2.textContent = 'A';
        answers_wrapper.appendChild(ans2);

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
}
import Card from '../basic/card'
import Question from '../../entities/question';
import Attempt from '../../entities/attempt';
import QuestionWithUserAnswers from '../../entities/question_with_user_answers';
import * as DateUtils from '../../utils/dateutils';
import * as PageManager from '../../1page/pagemanager';

import { ShuffleArray } from '../../utils/arrayutils';
import Toast from '../basic/toast';

export default class QuestionCard extends Card {
    protected CurrentQuestionNumberText: Text;
    protected TotalQuestionNumber: Text;
    protected CurrentScore: Text;
    protected QuestionTimerWrapper: HTMLSpanElement;
    protected TimeLeftTimer: Text;
    protected QuestionText: HTMLHeadingElement;
    protected AnswerWrapper: HTMLDivElement;
    protected DoneButton: HTMLButtonElement;
    protected NextButton: HTMLButtonElement;
    protected FinishButton: HTMLButtonElement;

    protected TimeLimit: number | undefined;
    protected AssignmentTimeLimit!: Date;
    protected TestStartDate!: Date;
    protected TimerRef: number | undefined;
    protected CurrentQuestionNumber!: number;
    protected Questions!: QuestionWithUserAnswers[];
    protected CurrentQuestion: QuestionWithUserAnswers | undefined;
    protected DisableAnswers: boolean = false;
    protected PointsGot!: number;
    protected PointsMax!: number;
    protected Attempt!: Attempt;

    OnTestFinished: ((questions: QuestionWithUserAnswers[]) => void) | undefined;

    constructor(){
        super();

        this.Element.classList.add('semi-wide');

        let q_metadata = document.createElement('div');
        q_metadata.classList.add('question-metadata');
        this.AppendChild(q_metadata);

        let q_number = document.createElement('span');
        q_number.classList.add('question-count');
        q_number.appendChild(this.CurrentQuestionNumberText = document.createTextNode('0'));
        q_number.appendChild(document.createTextNode('/'));
        q_number.appendChild(this.TotalQuestionNumber = document.createTextNode('0'));
        q_metadata.appendChild(q_number);

        let q_score = document.createElement('span');
        q_score.classList.add('question-score');
        q_score.appendChild(this.CurrentScore = document.createTextNode('0'));
        q_score.appendChild(document.createTextNode('%'));
        q_metadata.appendChild(q_score);

        this.QuestionTimerWrapper = document.createElement('span');
        this.QuestionTimerWrapper.classList.add('question-timer');
        q_metadata.appendChild(this.QuestionTimerWrapper);

        let q_timer_icon = document.createElement('i');
        q_timer_icon.classList.add('fa', 'fa-clock-o', 'icon');
        this.QuestionTimerWrapper.appendChild(q_timer_icon);
        this.QuestionTimerWrapper.appendChild(document.createTextNode(' '));
        this.QuestionTimerWrapper.appendChild(this.TimeLeftTimer = document.createTextNode('0:00'));

        this.QuestionText = document.createElement('h2');
        this.QuestionText.classList.add('question-text');
        this.QuestionText.textContent = 'Treść pytania';
        this.AppendChild(this.QuestionText);

        this.AnswerWrapper = document.createElement('div');
        this.AnswerWrapper.classList.add('question-answer-buttons');
        this.AppendChild(this.AnswerWrapper);

        this.DoneButton = document.createElement('button');
        this.DoneButton.classList.add('big', 'with-border');
        this.DoneButton.textContent = 'Gotowe';
        this.DoneButton.addEventListener('click', this.CheckQuestion.bind(this));
        this.AddButton(this.DoneButton);

        this.NextButton = document.createElement('button');
        this.NextButton.classList.add('big', 'with-border');
        this.NextButton.textContent = 'Następne pytanie';
        this.NextButton.addEventListener('click', this.GoToNextQuestion.bind(this));
        this.NextButton.style.display = 'none';
        this.AddButton(this.NextButton);

        this.FinishButton = document.createElement('button');
        this.FinishButton.classList.add('big', 'with-border');
        this.FinishButton.textContent = 'Zakończ test';
        this.FinishButton.addEventListener('click', this.FinishTest.bind(this));
        this.AddButton(this.FinishButton);
    }

    async StartTest(attempt: Attempt){
        PageManager.PreventFromNavigation('solving-test');
        this.Attempt = attempt;
        this.PointsGot = 0;
        this.PointsMax = 0;
        this.CurrentQuestionNumber = 0;
        this.Questions = QuestionWithUserAnswers.FromArray(await attempt.GetQuestions());

        let assignment = attempt.GetAssignment();
        this.AssignmentTimeLimit = await assignment.GetTimeLimit();

        let test = await assignment.GetTest();

        if(await test.HasTimeLimit()){
            this.TimeLimit = await test.GetTimeLimit();
            let assignment_time_limit_diff = DateUtils.DiffInSeconds(this.AssignmentTimeLimit);
            if(this.TimeLimit > assignment_time_limit_diff) this.TimeLimit = undefined;
        }else{
            this.TimeLimit = undefined;
        }
        this.StartTimer();
        this.TestStartDate = new Date();
        this.OnTimerTick(); // Displays the time

        this.TotalQuestionNumber.textContent = this.Questions.length.toString();

        this.DisplayQuestion(this.Questions[0], this.CurrentQuestionNumber + 1);
    }

    async DisplayQuestion(question: QuestionWithUserAnswers, number: number){
        this.CurrentQuestion = question;
        let question_text = await question.GetQuestion().GetText();
        this.QuestionText.textContent = question_text;
        if(question_text.length > 350){
            this.QuestionText.classList.add('long');
        }else{
            this.QuestionText.classList.remove('long');
        }

        this.CurrentQuestionNumberText.textContent = number.toString();

        let answers = await question.GetQuestion().GetAnswers();
        ShuffleArray(answers);
        this.CurrentQuestion.SetAnswers(answers);

        // Wyświetl odpowiedzi w sposób odpowiedni do typu pytania
        switch(await this.CurrentQuestion.GetQuestion().GetType()){
            case Question.TYPE_SINGLE_CHOICE:
            case Question.TYPE_MULTI_CHOICE:
                this.AnswerWrapper.textContent = '';
                for(let i = 0; i < answers.length; i++){
                    const answer = answers[i];
                    let answer_button = document.createElement('button');
                    answer_button.classList.add('answer-button');
                    answer_button.textContent = await answer.GetText();
                    answer_button.dataset.index = i.toString();
                    answer_button.addEventListener('click', ((e: MouseEvent) => {
                        this.OnAnswerButtonClick(e, i);
                    }).bind(this));
                    this.AnswerWrapper.appendChild(answer_button);
                }
                break;
            case Question.TYPE_OPEN_ANSWER:
                console.error('NotImplemented: OpenAnswerQuestion');
                break;
        }

        this.DoneButton.style.display = '';
        this.NextButton.style.display = 'none';
        this.FinishButton.style.display = 'none';
        this.DisableAnswers = false;
    }

    protected async OnAnswerButtonClick(e: MouseEvent, answer_index: number){
        if(this.DisableAnswers) return;

        switch(await this.CurrentQuestion?.GetQuestion().GetType()){
            case Question.TYPE_SINGLE_CHOICE:
                this.CurrentQuestion?.DeselectAllAnswers();
                this.CurrentQuestion?.SetAnswerSelection(answer_index, true);

                let ans_buttons_selected = document.querySelectorAll('.answer-button.selected');
                for(let btn of ans_buttons_selected){
                    btn.classList.remove('selected');
                }
                (e.target as HTMLButtonElement).classList.add('selected');
                break;
            case Question.TYPE_MULTI_CHOICE:
                this.CurrentQuestion?.ToggleAnswerSelection(answer_index);

                let is_selected = this.CurrentQuestion?.GetAnswerSelection(answer_index);
                if(is_selected) (e.target as HTMLButtonElement).classList.add('selected');
                else (e.target as HTMLButtonElement).classList.remove('selected');
                break;
        }
    }

    protected async CheckQuestion(){
        this.DisableAnswers = true;
        this.CurrentQuestion?.MarkAsDone();

        // Pokaż odpowiedni przycisk
        this.DoneButton.style.display = 'none';
        if(this.CurrentQuestionNumber + 1 < this.Questions.length){
            this.NextButton.style.display = '';
        }else{
            this.FinishButton.style.display = '';
            this.StopTimer();
            this.SaveResults();
        }

        if(this.CurrentQuestion === undefined) return;

        // Zaznacz odpowiedzi
        let answers_buttons = document.querySelectorAll('.answer-button');
        for(let button of answers_buttons){
            let index = parseInt((button as HTMLElement).dataset.index ?? '0');
            if(await this.CurrentQuestion.GetAnswers()[index].IsCorrect()){
                button.classList.add('correct');
            }else{
                button.classList.add('wrong');
            }
        }
    
        // Zaktualizuj wynik
        this.PointsGot += await this.CurrentQuestion.CountPoints();
        this.PointsMax += await this.CurrentQuestion.GetQuestion().GetPoints();
        this.UpdateScore();
    }

    protected GoToNextQuestion(){
        this.DoneButton.style.display = '';
        this.NextButton.style.display = 'none';

        this.CurrentQuestionNumber++;
        this.DisplayQuestion(this.Questions[this.CurrentQuestionNumber], this.CurrentQuestionNumber + 1);
    }

    protected StartTimer(){
        this.TimerRef = setInterval(this.OnTimerTick.bind(this), 1000);
    }

    protected StopTimer(){
        if(this.TimerRef === undefined) return;
        clearInterval(this.TimerRef);
    }

    protected async OnTimeIsUp(){
        this.QuestionText.textContent = 'Czas na rozwiązanie testu upłynął.';
        this.QuestionText.classList.remove('long');

        this.SaveResults();

        this.AnswerWrapper.textContent = '';
        this.FinishButton.style.display = '';
        this.NextButton.style.display = 'none';
        this.DoneButton.style.display = 'none';

        let points_max = 0;
        for(let question of this.Questions){
            points_max += await question.GetQuestion().GetPoints();
        }
        this.PointsMax = points_max;
        this.UpdateScore();
    }

    protected SaveResults(){
        PageManager.UnpreventFromNavigation('solving-test');
        try{
            this.Attempt.SaveUserAnswers(this.Questions);
            new Toast('Twoje odpowiedzi zostały zapisane').Show(0);
        }catch(e){
            // #25
            new Toast('Nie udało się zapisać odpowiedzi');
        }
    }

    protected OnTimerTick(){
        let assignment_time_limit_diff = DateUtils.DiffInSeconds(this.AssignmentTimeLimit)
        if(this.TimeLimit === undefined && assignment_time_limit_diff > 3600){
            this.TimeLeftTimer.textContent = '—';
        }else{
            let remaining_time = this.TimeLimit;
            if(remaining_time === undefined){
                remaining_time = assignment_time_limit_diff;
            }else{
                remaining_time -= (Date.now() - this.TestStartDate.getTime()) / 1000;
            }
            remaining_time = Math.round(remaining_time);

            if(remaining_time < 0){
                this.StopTimer();
                this.OnTimeIsUp();
            }else{
                if(remaining_time <= 60){
                    this.QuestionTimerWrapper.classList.add('error');
                }
                this.TimeLeftTimer.textContent = DateUtils.SecondsToTime(remaining_time);
            }
        }
    }

    protected UpdateScore(){
        if(this.PointsMax == 0) this.CurrentScore.textContent = '0';
        else this.CurrentScore.textContent = Math.round(100 * this.PointsGot / this.PointsMax).toString();
    }

    protected FinishTest(){
        this.OnTestFinished?.(this.Questions);
    }
}
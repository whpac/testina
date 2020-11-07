import Card from '../basic/card';
import Question from '../../entities/question';
import Attempt from '../../entities/attempt';
import QuestionWithUserAnswers from '../../entities/question_with_user_answers';
import * as DateUtils from '../../utils/dateutils';

import { ShuffleArray } from '../../utils/arrayutils';
import Toast from '../basic/toast';
import NavigationPrevention from '../../1page/navigation_prevention';
import Test from '../../entities/test';
import { runInThisContext } from 'vm';
import QuestionImage from './question_image';

export default class QuestionCard extends Card {
    protected CurrentQuestionNumberText: Text;
    protected TotalQuestionNumber: Text;
    protected CurrentScoreWrapper: HTMLElement;
    protected CurrentScore: Text;
    protected QuestionTimerWrapper: HTMLSpanElement;
    protected TimeLeftTimer: Text;
    protected QuestionText: HTMLHeadingElement;
    protected ImagesWrapper: HTMLDivElement;
    protected AnswerWrapper: HTMLDivElement;
    protected DoneButton: HTMLButtonElement;
    protected NextButton: HTMLButtonElement;
    protected FinishButton: HTMLButtonElement;

    protected OpenAnswerInput: HTMLInputElement | undefined;
    protected OpenAnswerFeedback: HTMLElement | undefined;

    protected TimeLimit: number | undefined;
    protected AssignmentDeadline!: Date;
    protected TestStartDate!: Date;
    protected TimerRef: number | undefined;
    protected CurrentQuestionNumber!: number;
    protected Questions!: QuestionWithUserAnswers[];
    protected CurrentQuestion: QuestionWithUserAnswers | undefined;
    protected DisableAnswers: boolean = false;
    protected PointsGot!: number;
    protected PointsMax!: number;
    protected Attempt!: Attempt;
    protected Test!: Test;

    OnTestFinished: ((questions: QuestionWithUserAnswers[]) => void) | undefined;

    constructor() {
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

        this.CurrentScoreWrapper = document.createElement('span');
        this.CurrentScoreWrapper.classList.add('question-score');
        this.CurrentScoreWrapper.appendChild(this.CurrentScore = document.createTextNode('0'));
        this.CurrentScoreWrapper.appendChild(document.createTextNode('%'));
        q_metadata.appendChild(this.CurrentScoreWrapper);

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

        this.ImagesWrapper = document.createElement('div');
        this.ImagesWrapper.classList.add('question-images');
        this.AppendChild(this.ImagesWrapper);

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

    async StartTest(attempt: Attempt) {
        NavigationPrevention.Prevent('solving-test');

        this.TimeLeftTimer.textContent = '0:00';
        this.CurrentScore.textContent = '0';
        this.TotalQuestionNumber.textContent = '0';
        this.CurrentQuestionNumberText.textContent = '0';

        this.Attempt = attempt;
        this.PointsGot = 0;
        this.PointsMax = 0;
        this.CurrentQuestionNumber = 0;
        this.Questions = QuestionWithUserAnswers.FromArray(await attempt.GetQuestions());

        let assignment = attempt.Assignment;
        this.AssignmentDeadline = assignment.Deadline;

        this.Test = assignment.Test;
        this.CurrentScoreWrapper.style.display = this.Test.DoHideCorrectAnswers ? 'none' : '';
        if(this.Test.DoHideCorrectAnswers) this.DoneButton.textContent = 'Następne pytanie';

        if(this.Test.HasTimeLimit()) {
            this.TimeLimit = this.Test.TimeLimit;
            let assignment_time_limit_diff = DateUtils.DiffInSeconds(this.AssignmentDeadline);
            if(this.TimeLimit > assignment_time_limit_diff) this.TimeLimit = undefined;
        } else {
            this.TimeLimit = undefined;
        }
        this.StartTimer();
        this.TestStartDate = new Date();
        this.OnTimerTick(); // Displays the time

        this.TotalQuestionNumber.textContent = this.Questions.length.toString();

        this.DisplayQuestion(this.Questions[0], this.CurrentQuestionNumber + 1);
    }

    async DisplayQuestion(question: QuestionWithUserAnswers, number: number) {
        this.CurrentQuestion = question;
        let question_text = question.GetQuestion().Text;
        if(question_text.length > 350) {
            this.QuestionText.classList.add('long');
        } else {
            this.QuestionText.classList.remove('long');
        }

        let rows = question_text.split('\n');
        this.QuestionText.textContent = '';

        for(let i = 0; i < rows.length; i++) {
            if(i != 0) this.QuestionText.appendChild(document.createElement('br'));
            this.QuestionText.appendChild(document.createTextNode(rows[i]));
        }

        this.CurrentQuestionNumberText.textContent = number.toString();

        let answers = await question.GetQuestion().GetAnswers();
        ShuffleArray(answers);
        this.CurrentQuestion.SetAnswers(answers);

        this.OpenAnswerFeedback = undefined;
        this.OpenAnswerInput = undefined;
        this.AnswerWrapper.textContent = '';

        // Wyświetl obrazki dołączone do pytania
        this.ImagesWrapper.textContent = '';
        for(let image_id of this.CurrentQuestion.GetQuestion().ImageIds) {
            this.ImagesWrapper.appendChild(new QuestionImage(image_id).GetElement());
        }

        // Wyświetl odpowiedzi w sposób odpowiedni do typu pytania
        switch(this.CurrentQuestion.GetQuestion().Type) {
            case Question.TYPE_SINGLE_CHOICE:
            case Question.TYPE_MULTI_CHOICE:
                for(let i = 0; i < answers.length; i++) {
                    const answer = answers[i];
                    let answer_button = document.createElement('button');
                    answer_button.classList.add('answer-button');
                    answer_button.textContent = answer.Text;
                    answer_button.dataset.id = answer.Id.toString();
                    answer_button.addEventListener('click', ((e: MouseEvent) => {
                        this.OnAnswerButtonClick(e, answer.Id.toString());
                    }).bind(this));
                    this.AnswerWrapper.appendChild(answer_button);
                }
                break;
            case Question.TYPE_OPEN_ANSWER:
                let type_label = document.createElement('span');
                type_label.textContent = 'Podaj odpowiedź:';
                this.AnswerWrapper.appendChild(type_label);

                this.OpenAnswerInput = document.createElement('input');
                this.OpenAnswerInput.type = 'text';
                this.AnswerWrapper.appendChild(this.OpenAnswerInput);

                this.OpenAnswerFeedback = document.createElement('span');
                this.AnswerWrapper.appendChild(this.OpenAnswerFeedback);
                break;
        }

        this.DoneButton.style.display = '';
        this.NextButton.style.display = 'none';
        this.FinishButton.style.display = 'none';
        this.DisableAnswers = false;

        if(this.CurrentQuestionNumber + 1 >= this.Questions.length && this.Test.DoHideCorrectAnswers) {
            this.NextButton.textContent = 'Zatwierdź';
        }
    }

    protected async OnAnswerButtonClick(e: MouseEvent, answer_id: string) {
        if(this.DisableAnswers) return;

        switch(this.CurrentQuestion?.GetQuestion().Type) {
            case Question.TYPE_SINGLE_CHOICE:
                this.CurrentQuestion?.DeselectAllAnswers();
                this.CurrentQuestion?.SetAnswerSelection(answer_id, true);

                let ans_buttons_selected = document.querySelectorAll('.answer-button.selected');
                for(let btn of ans_buttons_selected) {
                    btn.classList.remove('selected');
                }
                (e.target as HTMLButtonElement).classList.add('selected');
                break;
            case Question.TYPE_MULTI_CHOICE:
                this.CurrentQuestion?.ToggleAnswerSelection(answer_id);

                let is_selected = this.CurrentQuestion?.GetAnswerSelection(answer_id);
                if(is_selected) (e.target as HTMLButtonElement).classList.add('selected');
                else(e.target as HTMLButtonElement).classList.remove('selected');
                break;
        }
    }

    protected async CheckQuestion() {
        this.DisableAnswers = true;
        if(this.OpenAnswerInput !== undefined)
            this.OpenAnswerInput.readOnly = true;
        this.CurrentQuestion?.MarkAsDone();

        let whether_to_save = false;
        // Pokaż odpowiedni przycisk
        this.DoneButton.style.display = 'none';
        if(this.CurrentQuestionNumber + 1 < this.Questions.length) {
            this.NextButton.style.display = '';
        } else {
            this.FinishButton.style.display = '';
            this.StopTimer();
            whether_to_save = true;
        }

        if(this.CurrentQuestion === undefined) return;

        if(this.CurrentQuestion.GetQuestion().Type == Question.TYPE_OPEN_ANSWER) {
            let user_answer = this.OpenAnswerInput?.value.trim();
            this.CurrentQuestion.UserSuppliedAnswer = user_answer;
        }

        if(!this.Test.DoHideCorrectAnswers) {
            switch(this.CurrentQuestion.GetQuestion().Type) {
                case Question.TYPE_SINGLE_CHOICE:
                case Question.TYPE_MULTI_CHOICE:
                    // Zaznacz odpowiedzi
                    let answers_buttons = document.querySelectorAll('.answer-button');
                    for(let button of answers_buttons) {
                        let id = (button as HTMLElement).dataset.id ?? '0';
                        if(this.CurrentQuestion.GetAnswers()[id].Correct) {
                            button.classList.add('correct');
                        } else {
                            button.classList.add('wrong');
                        }
                    }
                    break;
                case Question.TYPE_OPEN_ANSWER:
                    if(this.CurrentQuestion.CountPoints() == 0) {
                        this.OpenAnswerInput?.classList.add('error');
                        this.OpenAnswerFeedback?.classList.add('error');
                        if(this.OpenAnswerFeedback !== undefined) {
                            this.OpenAnswerFeedback.textContent = 'Prawidłowa odpowiedź: ' + (await this.CurrentQuestion.GetQuestion().GetAnswers())[0].Text;
                        }
                    } else {
                        this.OpenAnswerInput?.classList.add('success');
                        this.OpenAnswerFeedback?.classList.add('success');
                        if(this.OpenAnswerFeedback !== undefined) {
                            this.OpenAnswerFeedback.textContent = 'Dobrze!';
                        }
                    }
                    break;
            }
        }

        // Zaktualizuj wynik
        this.PointsGot += this.CurrentQuestion.CountPoints();
        this.PointsMax += this.CurrentQuestion.GetQuestion().Points;
        this.UpdateScore();
        if(whether_to_save) this.SaveResults();
        else {
            if(this.Test.DoHideCorrectAnswers) {
                this.GoToNextQuestion();
            }
        }
    }

    protected GoToNextQuestion() {
        this.DoneButton.style.display = '';
        this.NextButton.style.display = 'none';

        this.CurrentQuestionNumber++;
        this.DisplayQuestion(this.Questions[this.CurrentQuestionNumber], this.CurrentQuestionNumber + 1);
    }

    protected StartTimer() {
        this.TimerRef = window.setInterval(this.OnTimerTick.bind(this), 1000);
    }

    protected StopTimer() {
        if(this.TimerRef === undefined) return;
        clearInterval(this.TimerRef);
    }

    protected async OnTimeIsUp() {
        this.QuestionText.textContent = 'Czas na rozwiązanie testu upłynął.';
        this.QuestionText.classList.remove('long');

        this.SaveResults();

        this.AnswerWrapper.textContent = '';
        this.FinishButton.style.display = '';
        this.NextButton.style.display = 'none';
        this.DoneButton.style.display = 'none';

        let points_max = 0;
        for(let question of this.Questions) {
            points_max += question.GetQuestion().Points;
        }
        this.PointsMax = points_max;
        this.UpdateScore();
    }

    protected SaveResults() {
        NavigationPrevention.Unprevent('solving-test');
        try {
            this.Attempt.SaveUserAnswers(this.Questions);
            new Toast('Twoje odpowiedzi zostały zapisane').Show(0);
        } catch(e) {
            let message = '.';
            if('Message' in e) {
                message = ': ' + e.Message;
            }
            new Toast('Nie udało się zapisać odpowiedzi' + message);
        }
    }

    protected OnTimerTick() {
        let assignment_time_limit_diff = DateUtils.DiffInSeconds(this.AssignmentDeadline);
        if(this.TimeLimit === undefined && assignment_time_limit_diff > 3600) {
            this.TimeLeftTimer.textContent = '—';
        } else {
            let remaining_time = this.TimeLimit;
            if(remaining_time === undefined) {
                remaining_time = assignment_time_limit_diff;
            } else {
                remaining_time -= (Date.now() - this.TestStartDate.getTime()) / 1000;
            }
            remaining_time = Math.round(remaining_time);

            if(remaining_time < 0) {
                this.StopTimer();
                this.OnTimeIsUp();
            } else {
                if(remaining_time <= 60) {
                    this.QuestionTimerWrapper.classList.add('error');
                }
                this.TimeLeftTimer.textContent = DateUtils.SecondsToTime(remaining_time);
            }
        }
    }

    protected UpdateScore() {
        if(this.PointsMax == 0) this.CurrentScore.textContent = '0';
        else this.CurrentScore.textContent = Math.round(100 * this.PointsGot / this.PointsMax).toString();
    }

    protected FinishTest() {
        this.OnTestFinished?.(this.Questions);
    }
}
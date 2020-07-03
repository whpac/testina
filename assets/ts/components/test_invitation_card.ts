import Card from './general/card';
import Assignment from '../entities/assignment';
import * as DateUtils from '../dateutils';

import { n } from '../textutils';
import { HandleLinkClick } from '../script';
import User from '../entities/user';
import Attempt from '../entities/attempt';

export default class TestInvitationCard extends Card {
    protected NameHeader: HTMLHeadingElement;
    protected QuestionCount: HTMLSpanElement;
    protected QuestionCountText: HTMLSpanElement;
    protected TimeLimit: HTMLSpanElement;
    protected TimeLimitText: HTMLSpanElement;
    protected RemainingAttempts: HTMLSpanElement;
    protected StartButton: HTMLButtonElement;
    protected TestLoadingWrapper: HTMLDivElement;
    protected Assignment: Assignment | undefined;

    OnTestLoaded: ((attempt: Attempt) => void) | undefined;

    constructor(){
        super();

        this.Element.classList.add('semi-wide');

        this.NameHeader = document.createElement('h2');
        this.NameHeader.classList.add('center');
        this.AppendChild(this.NameHeader);

        let summary = document.createElement('div');
        summary.classList.add('test-summary');
        this.AppendChild(summary);

        this.QuestionCount = document.createElement('span');
        this.QuestionCount.classList.add('question-count');
        summary.appendChild(this.QuestionCount);
        this.QuestionCountText = document.createElement('span');
        this.QuestionCountText.classList.add('question-count-text');
        this.QuestionCountText.textContent = 'pytań';
        summary.appendChild(this.QuestionCountText);

        this.TimeLimit = document.createElement('span');
        this.TimeLimit.classList.add('time-limit');
        summary.appendChild(this.TimeLimit);
        this.TimeLimitText = document.createElement('span');
        this.TimeLimitText.classList.add('time-limit-text');
        this.TimeLimitText.textContent = 'limit czasu';
        summary.appendChild(this.TimeLimitText);

        this.RemainingAttempts = document.createElement('span');
        this.RemainingAttempts.classList.add('remaining-attempts');
        this.RemainingAttempts.textContent = 'Podejść: 0';
        summary.appendChild(this.RemainingAttempts);

        let buttons_wrapper = document.createElement('div');
        buttons_wrapper.classList.add('buttons');
        summary.appendChild(buttons_wrapper);

        let exit_button = document.createElement('a');
        exit_button.href = 'testy/lista';
        exit_button.classList.add('button', 'big', 'with-border', 'exit-test');
        exit_button.textContent = 'Wróć do listy';
        exit_button.addEventListener('click', (e) => HandleLinkClick(e, 'testy/lista'));
        buttons_wrapper.appendChild(exit_button);

        this.StartButton = document.createElement('button');
        this.StartButton.classList.add('big', 'with-border', 'start-test');
        this.StartButton.textContent = 'Rozpocznij';
        this.StartButton.addEventListener('click', this.LoadTest.bind(this));
        buttons_wrapper.appendChild(this.StartButton);

        this.TestLoadingWrapper = document.createElement('div');
        this.TestLoadingWrapper.style.display = 'none';
        this.AppendChild(this.TestLoadingWrapper);

        let loading_text = document.createElement('div');
        loading_text.classList.add('loading-test');
        loading_text.textContent = 'Wczytywanie testu...';
        this.TestLoadingWrapper.appendChild(loading_text);

        let progress_bar = document.createElement('div');
        progress_bar.classList.add('progress-indeterminate');
        this.TestLoadingWrapper.appendChild(progress_bar);
    }

    async Populate(assignment: Assignment){
        this.Assignment = assignment;

        let time_limit = '0:00';
        let has_time_limit = false;
        let test = await assignment.GetTest();
        let question_count = Math.round(await test.GetQuestionCount() * await test.GetQuestionMultiplier());

        if(test.HasTimeLimit()){
            if(await test.GetTimeLimit() > DateUtils.DiffInSeconds(await assignment.GetTimeLimit())){
                time_limit = DateUtils.ToDayHourFormat(await assignment.GetTimeLimit());
            }else{
                time_limit = DateUtils.SecondsToTime(await test.GetTimeLimit());
                has_time_limit = true;
            }
        }else{
            time_limit = DateUtils.ToDayHourFormat(await assignment.GetTimeLimit());
        }

        this.NameHeader.textContent = await test.GetName();
        this.QuestionCount.textContent = question_count.toString();
        this.QuestionCountText.textContent = 'pyta' + n(question_count, 'nie', 'nia', 'ń');
        this.TimeLimit.textContent = time_limit;
        this.TimeLimitText.textContent = has_time_limit ? 'limit czasu' : 'termin';

        let rem_text;
        let attempts_left = await assignment.GetRemainingAttemptsCount();
        if(await assignment.HasTimeLimitExceeded()) rem_text = 'Termin rozwiązania tego testu upłynął';
        else if(await assignment.AreAttemptsUnlimited()) rem_text = 'Do tego testu możesz podejść dowolną liczbę razy';
        else if(attempts_left == 0) rem_text = 'Wykorzystał' + (await (await User.GetCurrent()).IsFemale() ? 'a' : 'e') + 'ś już wszystkie podejścia';
        else rem_text = 'Pozostał' + n(attempts_left, 'o', 'y', 'o') + ' ci jeszcze ' + attempts_left + ' podejś' + n(attempts_left, 'cie', 'cia', 'ć');

        this.RemainingAttempts.textContent = rem_text;

        if(!(await assignment.AreRemainingAttempts()) || (await assignment.HasTimeLimitExceeded())){
            this.StartButton.remove();
        }
    }

    async LoadTest(){
        if(this.Assignment === undefined) throw 'TestInvitationCard.Assignment is not defined.';
        let attempt_awaiter = Attempt.Create(this.Assignment);
        this.TestLoadingWrapper.style.display = '';

        let attempt = await attempt_awaiter;
        this.OnTestLoaded?.(attempt);
        
        this.TestLoadingWrapper.style.display = 'none';
    }
}
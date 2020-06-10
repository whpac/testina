/**
 * @file Script responsible for managing tests being solved by users
 * @author Marcin Szwarc
 * @copyright 2020
 * @version 1.0
 */

import * as Dialogs from './dialogs';
import * as Toasts from './toasts';
import * as Typedefs from './typedefs';

import { FormatTime, Round, ShuffleArray } from './functions';
import { SaveTestResultsXHR } from './remote_ifaces';

/**
 * Represents current test
 */
let Test: (Typedefs.TestDescriptor);

/**
 * Test start date and time
 */
let TestStartDate: Date;

/**
 * Timer reference
 */
let TestTimer: number;

/**
 * Current question
 */
let CurrentQuestion: Typedefs.QuestionDescriptor;

/**
 * Stores user answers in format [question number][answer id]
 */
let UserAnswers: Typedefs.UserAnswerDescriptor[] = [];

/**
 * Tells if answer buttons are disabled
 */
let DisableAnswers: boolean = false;

/**
 * Whether the results were already sent
 */
let ResultsSent: boolean = false;

/**
 * Number of points got by user
 */
let Points: number = 0;

/**
 * Total number of points the user could get
 */
let TotalPoints: number = 0;

/**
 * Map between array indices and array ids
 */
let AnswerIndices: number[][] = [];

export const TYPE_SINGLE_CHOICE = 0;
export const TYPE_MULTI_CHOICE = 1;
export const TYPE_OPEN_ANSWER = 2;

export const COUNTING_LINEAR = 0;
export const COUNTING_BINARY = 1;

/**
 * Downloads a test from server and initialises it. Automatically displays the first question.
 * @param test_id - id of the test to display
 */
export function LoadTest(test_id: number){
    $('.test-summary > .buttons').hide();
    $('#test-loading-information').show();

    // Connect to server and download test
    $.getJSON('api/get_test/id=' + test_id, function(json){
        if(!json.is_success){
            DisplayLoadingError(json.message);
            return;
        }

        Test = json;
        TestStartDate = new Date();
        Points = 0;
        TotalPoints = 0;

        Test.path.forEach((_, question_number) => {
            UserAnswers[question_number] = {done: false};
            AnswerIndices[question_number] = [];
        });

        $('#test-invitation').hide();
        ShowQuestion(0);
        $('#question-count').text(Test.path.length);
        $('#remaining-time').text(FormatTime(Test.time_limit));
        $('#question-wrapper').show();
        TestTimer = setInterval(UpdateTimer, 1000);
    });
}

/**
 * Displays specified question to the user.
 * @param question_number - number of question on the test path (beggining with 0)
 */
function ShowQuestion(question_number: number){
    let question_id = Test.path[question_number];
    if(question_id === undefined) return;

    let question = Test.questions[question_id];
    CurrentQuestion = question;
    CurrentQuestion.number = question_number;

    $('#question-text').text(question.text);
    $('#current-question-number').text(question_number+1);

    if(question.text.length > 350){
        $('#question-text').addClass('long');
    }else{
        $('#question-text').removeClass('long');
    }

    $('#question-answer-field').empty();

    let answers = question.answers.slice(0);
    ShuffleArray(answers);
    answers.forEach((answer) => {
        if(answer.index === undefined) return;

        var btn = document.createElement('button');
        btn.classList.add('answer-button');
        btn.innerText = answer.text;
        btn.dataset.index = answer.index.toString();
        UserAnswers[question_number][answer.index] = false;
        AnswerIndices[question_number][answer.index] = answer.id;
        $(btn).on('click', function(e){
            if(DisableAnswers) return;
            if(e.target.dataset.index === undefined) return;

            let answer_index = parseInt(e.target.dataset.index);
            if(isNaN(answer_index)) return;

            switch(CurrentQuestion.type){
                case TYPE_SINGLE_CHOICE:
                    $('.answer-button.selected').removeClass('selected');
                    Object.keys(UserAnswers[question_number]).forEach((index) => {
                        let index_num = parseInt(index);
                        if(isNaN(index_num)) return;
                        UserAnswers[question_number][index_num] = false;
                    });

                    $(e.target).addClass('selected');
                    UserAnswers[question_number][answer_index] = true;
                    break;
                case TYPE_MULTI_CHOICE:
                    $(e.target).toggleClass('selected');
                    UserAnswers[question_number][answer_index] = $(e.target).hasClass('selected');
                    break;
            }
        });
        $('#question-answer-field').append(btn);
    });
    $('#check-button').show();
    $('#next-button').hide();
    DisableAnswers = false;
}

/**
 * Marks answer buttons as good or wrong and updates score
 */
export function MarkAnswers(){
    CurrentQuestion.number = CurrentQuestion.number ?? 0;

    $('#check-button').hide();
    if(Test.path.length - 1 > CurrentQuestion.number){
        $('#next-button').show();
    }else{
        clearInterval(TestTimer);
        $('#end-button').show();
    }

    UserAnswers[CurrentQuestion.number].done = true;
    DisableAnswers = true;
    $('.answer-button').each((i, btn) => {
        let index = $(btn).data("index");
        $(btn).addClass(CurrentQuestion.answers[index].correct ? 'correct' : 'wrong');
    });

    Points += CountPoints(CurrentQuestion.number);
    TotalPoints += CurrentQuestion.points;
    UpdateScore();
}

/**
 * Counts points for question specified by a number
 * @param question_number - number of question to count points
 * @return number of points got in the question
 */
function CountPoints(question_number: number){
    var question = Test.questions[Test.path[question_number]];
    if(!UserAnswers[question_number].done) return 0;

    switch(question.points_counting){
        case COUNTING_BINARY:
            let number_of_correct_choices = 0;
            Object.keys(UserAnswers[question_number]).forEach((index) => {
                let index_num = parseInt(index);
                if(isNaN(index_num)) return;        // This function should only run for answers (numerical keys)
                if(question.answers[index_num].correct == UserAnswers[question_number][index_num])
                    number_of_correct_choices++;
            });

            if(number_of_correct_choices == question.answers.length)
                return question.points;
            else
                return 0;
        break;
        
        case COUNTING_LINEAR:
            let number_of_wrong_choices = 0;
            let number_of_correct = 0;
            Object.keys(UserAnswers[question_number]).forEach((index) => {
                let index_num = parseInt(index);
                if(isNaN(index_num)) return;        // This function should only run for answers (numerical keys)
                if(question.answers[index_num].correct != UserAnswers[question_number][index_num])
                    number_of_wrong_choices++;
                if(question.answers[index_num].correct)
                    number_of_correct++;
            });

            let correct_factor = 1 - (number_of_wrong_choices / number_of_correct);
            if(correct_factor < 0) correct_factor = 0;
            return correct_factor * question.points;
        break;

        default:
            return 0;
    }
}

/**
 * Switches to the next question
 */
export function GoToNextQuestion(){
    ShowQuestion((CurrentQuestion.number ?? 0) + 1);
}

/**
 * Finishes test, displays summary and sends results to the server
 */
export function EndTest(){
    $('#question-wrapper').hide();
    SendResults();
    ShowSummary();
    $('#after-test-message').show();
}

/**
 * Sends results to the server
 */
function SendResults(){
    if(ResultsSent) return;

    let answers_to_send: number[][] = [];
    let question_ids: number[] = [];

    UserAnswers.forEach((_, question_number) => {
        answers_to_send[question_number] = [];
        question_ids[question_number] = Test.path[question_number];

        Object.keys(UserAnswers[question_number]).forEach((index) => {
            let index_num = parseInt(index);
            if(isNaN(index_num)) return;        // This function should only run for answers (numerical keys)
            if(!UserAnswers[question_number][index_num]) return;
            let id = AnswerIndices[question_number][index_num];
            answers_to_send[question_number].push(id);
        })
    });

    let data: SaveTestResultsXHR = {
        attempt_id: Test.attempt_id,
        questions: answers_to_send,
        question_ids: question_ids
    };

    let save = $.post('api/save_test_results', JSON.stringify(data));
    ResultsSent = true;

    save.fail(() => {alert('Nie udało się wysłać wyników.');});
    save.done((data) => {
        if(data.is_success === undefined)
            Dialogs.CreateSimpleDialog('Wystąpił nieznany błąd podczas zapisywania wyników.').Show();
        else if(data.is_success === false)
            Dialogs.CreateSimpleDialog(data.message, undefined, 'Błąd').Show();
        else{
            Toasts.Show('Podejście zostało zapisane.');
            $('#average-percentage-score').text(data.average_score);
            $('#average-score-wrapper').css('visibility', 'visible');
        }
    });
}

/**
 * Displays summary of the test to the user
 */
function ShowSummary(){
    var results: Typedefs.ResultsDescriptor = {};
    UserAnswers.forEach((_, i) => {
        let question = Test.questions[Test.path[i]];
        if(results[question.id] === undefined){
            results[question.id] = {
                got: CountPoints(i),
                max: question.points
            };
        }else{
            results[question.id].got += CountPoints(i);
            results[question.id].max += question.points;
        }
    });
    Object.keys(results).forEach(function(key_str) {
        let key = parseInt(key_str);
        if(isNaN(key)) return;

        let question = Test.questions[key];
        let result = results[key];
        let tr = document.createElement('tr');
        tr.innerHTML = '<td>' + question.text + '</td><td class="center">' + Round(result.got, 2) + '/' + result.max + '</td>';
        $('#out').append(tr);
    });
}

/**
 * Displays a notice that time for the test has run out
 */
function ShowTimeOutNotice(){
    $('#question-text').html('Czas na rozwiązanie testu upłynął <span class="emoji">😢</span>').removeClass('long');
    $('#question-answer-field').empty();

    var btn = document.createElement('button');
    btn.classList.add('answer-button');
    btn.innerText = 'Przejdź do wyników';
    $(btn).on('click', EndTest);

    $('#question-answer-field').append(btn);
    $('#check-button').hide();
    $('#next-button').hide();
    DisableAnswers = false;

    TotalPoints = Test.total_points;
    UpdateScore();
    SendResults();
}

/**
 * Updates question timer
 */
function UpdateTimer(){
    let remaining_time = Test.time_limit;
    remaining_time -= (Date.now() - TestStartDate.getTime()) / 1000;

    if(remaining_time <= 0){
        remaining_time = 0;
        clearInterval(TestTimer);
        $('#remaining-time').addClass('error');
        ShowTimeOutNotice();
    }

    $('#remaining-time').text(FormatTime(remaining_time));
}

/**
 * Updates question score
 */
function UpdateScore(){
    if(TotalPoints == 0) return;
    $('.percentage-score').text(Math.round(100 * Points / TotalPoints));
}

/**
 * Displays an error encountered during test loading
 * @param error_message Error message
 */
function DisplayLoadingError(error_message: string){
    let elem = $('#test-loading-information .loading-test');
    elem.addClass('error');
    elem.text('Nie udało się załadować testu: ' + error_message);

    $('#test-loading-information .progress-indeterminate').hide();
}

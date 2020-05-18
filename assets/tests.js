/**
 * @file Script responsible for managing tests being solved by users
 * @author Marcin Szwarc
 * @copyright 2020
 * @version 1.0
 */

/**
 * This module is responsible for managing tests being solved by users
 * @module Tests
 */
var Tests = {
    /**
     * Represents current test
     * @type {object}
     */
    Test: null,

    /**
     * Test start date and time
     * @type {Date}
     */
    TestStartDate: null,

    /**
     * Timer reference
     * @type {number}
     */
    TestTimer: null,

    /**
     * Current question
     * @type {object}
     */
    CurrentQuestion: null,
    
    /**
     * Stores user answers in format [question number][answer id]
     * @type {object[]}
     */
    UserAnswers: [],

    /**
     * Tells if answer buttons are disabled
     * @type {boolean}
     */
    DisableAnswers: false,

    /**
     * Whether the results were already sent
     * @type {bool}
     */
    ResultsSent: false,

    /**
     * Number of points got by user
     * @type {number}
     */
    Points: 0,

    /**
     * Total number of points the user could get
     * @type {number}
     */
    TotalPoints: 0,

    /**
     * Map between array indices and array ids
     * @type {number[][]}
     */
    AnswerIndices: [],

    TYPE_SINGLE_CHOICE: 0,
    TYPE_MULTI_CHOICE: 1,

    COUNTING_LINEAR: 0,
    COUNTING_BINARY: 1,

    /**
     * Downloads a test from server and initialises it. Automatically displays the first question.
     * @param {number} test_id - id of the test to display
     * @static
     */
    LoadTest: function (test_id = 0){
        $('.test-summary > .buttons').hide();
        $('#test-loading-information').show();

        // Connect to server and download test
        $.getJSON('api/get_test/id=' + test_id, function(json){
            if(!json.is_success){
                Tests.DisplayLoadingError(json.message);
                return;
            }

            Tests.Test = json;
            Tests.TestStartDate = new Date();
            Tests.Points = 0;
            Tests.TotalPoints = 0;

            Tests.Test.path.forEach((_, question_number) => {
                Tests.UserAnswers[question_number] = {done: false};
                Tests.AnswerIndices[question_number] = [];
            });

            $('#test-invitation').hide();
            Tests.ShowQuestion(0);
            $('#question-count').text(Tests.Test.path.length);
            $('#remaining-time').text(formatTime(Tests.Test.time_limit));
            $('#question-wrapper').show();
            Tests.TestTimer = setInterval(Tests.UpdateTimer, 1000);
        });
    },

    /**
     * Displays specified question to the user.
     * @param {number} question_number - number of question on the test path (beggining with 0)
     */
    ShowQuestion: function(question_number){
        let question_id = Tests.Test.path[question_number];
        if(question_id === undefined) return;
    
        let question = Tests.Test.questions[question_id];
        Tests.CurrentQuestion = question;
        Tests.CurrentQuestion.number = question_number;
    
        $('#question-text').text(question.text);
        $('#current-question-number').text(question_number+1);
    
        if(question.text.length > 350){
            $('#question-text').addClass('long');
        }else{
            $('#question-text').removeClass('long');
        }
    
        $('#question-answer-field').empty();
    
        let answers = question.answers.slice(0);
        shuffleArray(answers);
        answers.forEach((answer) => {
            var btn = document.createElement('button');
            btn.classList.add('answer-button');
            btn.innerText = answer.text;
            btn.dataset.index = answer.index;
            Tests.UserAnswers[question_number][answer.index] = false;
            Tests.AnswerIndices[question_number][answer.index] = answer.id;
            $(btn).on('click', function(e){
                if(Tests.DisableAnswers) return;

                switch(Tests.CurrentQuestion.type){
                    case Tests.TYPE_SINGLE_CHOICE:
                        $('.answer-button.selected').removeClass('selected');
                        Object.keys(Tests.UserAnswers[question_number]).forEach((index) => {
                            if(isNaN(index)) return;
                            Tests.UserAnswers[question_number][index] = false;
                        });

                        $(e.target).addClass('selected');
                        Tests.UserAnswers[question_number][e.target.dataset.index] = true;
                        break;
                    case Tests.TYPE_MULTI_CHOICE:
                        $(e.target).toggleClass('selected');
                        Tests.UserAnswers[question_number][e.target.dataset.index] = $(e.target).hasClass('selected');
                        break;
                }
            });
            $('#question-answer-field').append(btn);
        });
        $('#check-button').show();
        $('#next-button').hide();
        Tests.DisableAnswers = false;
    },

    /**
     * Marks answer buttons as good or wrong and updates score
     */
    MarkAnswers: function(){
        $('#check-button').hide();
        if(Tests.Test.path.length - 1 > Tests.CurrentQuestion.number){
            $('#next-button').show();
        }else{
            clearInterval(Tests.TestTimer);
            $('#end-button').show();
        }
    
        Tests.UserAnswers[Tests.CurrentQuestion.number].done = true;
        Tests.DisableAnswers = true;
        $('.answer-button').each((i, btn) => {
            let index = $(btn).data("index");
            $(btn).addClass(Tests.CurrentQuestion.answers[index].correct ? 'correct' : 'wrong');
        });
    
        Tests.Points += Tests.CountPoints(Tests.CurrentQuestion.number);
        Tests.TotalPoints += Tests.CurrentQuestion.points;
        Tests.UpdateScore();
    },
    
    /**
     * Counts points for question specified by a number
     * @param {number} question_number - number of question to count points
     * @return {number} number of points got in the question
     */
    CountPoints: function(question_number){
        var question = Tests.Test.questions[Tests.Test.path[question_number]];
        if(!Tests.UserAnswers[question_number].done) return 0;
    
        switch(question.points_counting){
            case Tests.COUNTING_BINARY:
                let number_of_correct_choices = 0;
                Object.keys(Tests.UserAnswers[question_number]).forEach((index) => {
                    if(isNaN(index)) return;        // This function should only run for answers (numerical keys)
                    if(question.answers[index].correct == Tests.UserAnswers[question_number][index])
                        number_of_correct_choices++;
                });

                if(number_of_correct_choices == question.answers.length)
                    return question.points;
                else
                    return 0;
            break;
            
            case Tests.COUNTING_LINEAR:
                let number_of_wrong_choices = 0;
                let number_of_correct = 0;
                Object.keys(Tests.UserAnswers[question_number]).forEach((index) => {
                    if(isNaN(index)) return;        // This function should only run for answers (numerical keys)
                    if(question.answers[index].correct != Tests.UserAnswers[question_number][index])
                        number_of_wrong_choices++;
                    if(question.answers[index].correct)
                        number_of_correct++;
                });

                let correct_factor = 1 - (number_of_wrong_choices / number_of_correct);
                if(correct_factor < 0) correct_factor = 0;
                return correct_factor * question.points;
            break;

            default:
                return 0;
        }
    },
    
    /**
     * Switches to the next question
     */
    GoToNextQuestion: function(){
        Tests.ShowQuestion(Tests.CurrentQuestion.number + 1);
    },
    
    /**
     * Finishes test, displays summary and sends results to the server
     */
    EndTest: function(){
        $('#question-wrapper').hide();
        Tests.SendResults();
        Tests.ShowSummary();
        $('#after-test-message').show();
    },
    
    /**
     * Sends results to the server
     */
    SendResults: function(){
        if(Tests.ResultsSent) return;

        let data = {};
        let answers_to_send = [];
        let question_ids = [];
        data.attempt_id = Tests.Test.attempt_id;

        Tests.UserAnswers.forEach((_, question_number) => {
            answers_to_send[question_number] = [];
            question_ids[question_number] = Tests.Test.path[question_number];

            Object.keys(Tests.UserAnswers[question_number]).forEach((index) => {
                if(isNaN(index)) return;        // This function should only run for answers (numerical keys)
                if(!Tests.UserAnswers[question_number][index]) return;
                let id = Tests.AnswerIndices[question_number][index];
                answers_to_send[question_number].push(id);
            })
        });

        data.questions = answers_to_send;
        data.question_ids = question_ids;

        let save = $.post('api/save_test_results', JSON.stringify(data));
        Tests.ResultsSent = true;

        save.fail(() => {alert('Nie udało się wysłać wyników.');});
        save.done((data) => {
            if(data.is_success === undefined)
                Dialogs.CreateSimpleDialog('Wystąpił nieznany błąd podczas zapisywania wyników.').Show();
            else if(data.is_success === false)
                Dialogs.CreateSimpleDialog(data.message, null, 'Błąd').Show();
            else{
                Toasts.Show('Podejście zostało zapisane.');
                $('#average-percentage-score').text(data.average_score);
                $('#average-score-wrapper').css('visibility', 'visible');
            }
        });
    },
    
    /**
     * Displays summary of the test to the user
     */
    ShowSummary: function(){
        var results = {};
        Tests.UserAnswers.forEach((_, i) => {
            let question = Tests.Test.questions[Tests.Test.path[i]];
            if(results[question.id] === undefined){
                results[question.id] = {
                    got: Tests.CountPoints(i),
                    max: question.points
                };
            }else{
                results[question.id].got += Tests.CountPoints(i);
                results[question.id].max += question.points;
            }
        });
        Object.keys(results).forEach(function(key) {
            let question = Tests.Test.questions[key];
            let result = results[key];
            let tr = document.createElement('tr');
            tr.innerHTML = '<td>' + question.text + '</td><td class="center">' + round(result.got, 2) + '/' + result.max + '</td>';
            $('#out').append(tr);
        });
    },

    /**
     * Displays a notice that time for the test has run out
     */
    ShowTimeOutNotice: function(){
        $('#question-text').html('Czas na rozwiązanie testu upłynął <span class="emoji">😢</span>').removeClass('long');
        $('#question-answer-field').empty();
    
        var btn = document.createElement('button');
        btn.classList.add('answer-button');
        btn.innerText = 'Przejdź do wyników';
        $(btn).on('click', Tests.EndTest);

        $('#question-answer-field').append(btn);
        $('#check-button').hide();
        $('#next-button').hide();
        Tests.DisableAnswers = false;

        Tests.TotalPoints = Tests.Test.total_points;
        Tests.UpdateScore();
        Tests.SendResults();
    },
    
    /**
     * Updates question timer
     */
    UpdateTimer: function(){
        let remaining_time = Tests.Test.time_limit;
        remaining_time -= (new Date - Tests.TestStartDate) / 1000;
    
        if(remaining_time <= 0){
            remaining_time = 0;
            clearInterval(Tests.TestTimer);
            $('#remaining-time').addClass('error');
            Tests.ShowTimeOutNotice();
        }
    
        $('#remaining-time').text(formatTime(remaining_time));
    },
    
    /**
     * Updates question score
     */
    UpdateScore: function(){
        if(Tests.TotalPoints == 0) return;
        $('.percentage-score').text(Math.round(100 * Tests.Points / Tests.TotalPoints));
    },

    /**
     * Displays an error encountered during test loading
     * @param {string} error_message Error message
     */
    DisplayLoadingError: function(error_message){
        let elem = $('#test-loading-information .loading-test');
        elem.addClass('error');
        elem.text('Nie udało się załadować testu: ' + error_message);

        $('#test-loading-information .progress-indeterminate').hide();
    }
};
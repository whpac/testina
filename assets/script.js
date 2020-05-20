$(window).on('load', onLoad);

function onLoad(){
    $('body').removeClass('preload');
    $('.nav-toggle').on('click', function(){
        $('#main-nav').toggleClass('shown');
    });
    $('.nav-backdrop').on('click', function(){
        $('#main-nav').removeClass('shown');
    });
    $('.start-test').on('click', function(){
        Tests.LoadTest(this.dataset.testId);
    });
    $('#check-button').on('click', Tests.MarkAnswers);
    $('#next-button').on('click', Tests.GoToNextQuestion);
    $('#end-button').on('click', Tests.EndTest);
}

/**
 * Formats number of seconds to [hh:]mm:ss
 * @param {number} time_int - number of seconds
 * @return {string} the formatted string
 */
function formatTime(time_int){
    time_int = Math.round(time_int);
    let sec = time_int % 60;
    time_int -= sec;
    time_int /= 60;
    let min = time_int % 60;
    time_int -= min;
    time_int /= 60;
    let hrs = time_int;

    let time_string;
    if(sec < 10) sec = "0" + sec;
    time_string = ":" + sec;

    if(hrs > 0 && min < 10) min = "0" + min;
    time_string = min + time_string;

    if(hrs > 0) time_string = hrs + ":" + time_string;

    return time_string;
}

/**
 * Shuffles the given array
 * @param {array} array - array to shuffle, passed by reference
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

/**
 * Rounds number to specified count of decimals
 * @param {number} num - number to round
 * @param {number} decimals - count of decimals, defaults to 0
 * @return {number}
 */
function round(num, decimals = 0){
    return Math.round((num + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Truncates text at specified length - at the end of word
 * @param {string} str - string to truncate
 * @param {number} length - minimum number of characters to preserve
 */
function truncate(str, length){
    if(str.length <= length) return str;

    sp_pos = str.indexOf(' ', length);
    if(sp_pos === false) return str;

    str = str.substr(0, sp_pos);
    return str + '…';
}
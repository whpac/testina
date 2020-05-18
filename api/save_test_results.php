<?php
use \UEngine\Modules\Pages\PageManager;
PageManager::SetRenderer(new \Layout\ApiRenderer());

$input = file_get_contents("php://input");
$json = json_decode($input);

$attempt_id = $json->attempt_id;
if(!is_numeric($attempt_id)){
    Layout\ApiRenderer::ThrowError('Parametr id jest w niewłaściwym formacie.');
    return;
}

// Check if this test is assigned to current user
$attempt = new Entities\Attempt($attempt_id);

$assignment = $attempt->GetAssignment();
$current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();

if(!$assignment->IsForUser($current_user)){
    Layout\ApiRenderer::ThrowError('Nie masz dostępu do tego testu.');
    return;
}

// Check if attempt limit is not exceeded
if(!$assignment->AreRemainingAttempts($current_user)){
    Layout\ApiRenderer::ThrowError('Wykorzystał'.($current_user->IsFemale() ? 'a' : 'e').'ś już wszystkie podejścia.');
    return;
}

// Check if submission is not after time
// If there is time limit for attempt, it's sufficient to
// start solving before assignment deadline
$test = $assignment->GetTest();
if($test->HasTimeLimit()){
    $time_limit = $test->GetTimeLimit();
    $time_limit += 60; // Additional minute interval for processing requests
    $interval = new DateInterval('PT'.$time_limit.'S');
    $time_limit = $assignment->GetTimeLimit()->add($interval);

    if($time_limit < new \DateTime()){
        Layout\ApiRenderer::ThrowError('Termin rozwiązania tego testu upłynął.');
        return;
    }
}else{
    if($assignment->HasTimeLimitExceeded()){
        Layout\ApiRenderer::ThrowError('Termin rozwiązania tego testu upłynął.');
        return;
    }
}

$result = true;
foreach($json->questions as $question_index => $answers){
    if(count($answers) == 0){
        $question_id = $json->question_ids[$question_index];
        Entities\UserAnswer::CreateNoAnswer($attempt, $question_index, new Entities\Question($question_id));
    }
    foreach($answers as $answer_id){
        try{
            Entities\UserAnswer::Create($attempt, new Entities\Answer($answer_id), $question_index);
        }catch(Exception $e){
            $result = false;
        }
    }
}

// Count score
$user_answers = $attempt->GetUserAnswers();
$answered_questions = $user_answers->GetAnsweredQuestions();

$score_got = 0;
$score_max = 0;

foreach($answered_questions as $question){
    $answer_sets = $user_answers->GetAnswersByQuestion($question);
    
    foreach($answer_sets as $answer_set){
        $score_got += $question->CountPoints($answer_set);
        $score_max += $question->GetPoints();
    }
}

if(!$result){
    Layout\ApiRenderer::ThrowError('Wystąpił błąd podczas zapisywania odpowiedzi do bazy danych.');
    $attempt->Remove();
    return;
}

// Update attempt to reflect the score
$attempt->UpdateScore($score_got, $score_max);

$avg_score = $assignment->GetAverageScore($current_user);

echo('{"is_success":true, "average_score":'.$avg_score.'}');
?>
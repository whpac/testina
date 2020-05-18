<?php
use \UEngine\Modules\Pages\PageManager;
PageManager::SetRenderer(new \Layout\ApiRenderer());

if(!isset($_GET['id'])){
    // Return error message
    Layout\ApiRenderer::ThrowError('Parametr id jest wymagany.');
    return;
}

// $_GET['id'] = assignment_id
$assignment_id = $_GET['id'];
if(!is_numeric($assignment_id)){
    Layout\ApiRenderer::ThrowError('Parametr id jest w niewłaściwym formacie.');
    return;
}

// Check if this test is assigned to current user
$assignment = new Entities\Assignment($assignment_id);
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

// Check if time limit is not exceeded
if($assignment->HasTimeLimitExceeded()){
    Layout\ApiRenderer::ThrowError('Termin rozwiązania tego testu upłynął.');
    return;
}

// Create a new attempt
try{
    $attempt = Entities\Attempt::Create($current_user, $assignment);
}catch(Exception $e){
    Layout\ApiRenderer::ThrowError($e->GetMessage());
    return;
}

// Retrieve the test
try{
    $test = $assignment->GetTest();
}catch(Exception $e){
    Layout\ApiRenderer::ThrowError($e->GetMessage());
    return;
}

// Prepare the test object
$test_obj = [];
$test_obj['is_success'] = true;
$test_obj['attempt_id'] = $attempt->GetId();
$test_obj['test_name'] = $test->GetName();

$test_obj['time_limit'] = \Utils\DateTimeExt::DiffInSeconds($assignment->GetTimeLimit());

if($test->HasTimeLimit() && $test_obj['time_limit'] > $test->GetTimeLimit())
    $test_obj['time_limit'] = $test->GetTimeLimit();

$test_obj['total_points'] = 0;
$test_obj['questions'] = [];
$test_obj['path'] = [];

$total_points = 0;

// Retrieve questions and answers
$questions = $test->GetQuestions();
$question_ids = [];
foreach($questions as $q){
    $question = [];
    $question['id'] = $q->GetId();
    $question['text'] = $q->GetText();
    $question['type'] = $q->GetType();
    $question['points'] = $q->GetPoints();
    $question['points_counting'] = $q->GetPointsCounting();
    $question['answers'] = [];

    $question_ids[] = $q->GetId();

    $answers = $q->GetAnswers();
    $index = 0;
    foreach($answers as $a){
        $answer = [];
        $answer['id'] = $a->GetId();
        $answer['index'] = $index;
        $answer['text'] = $a->GetText();
        $answer['correct'] = $a->IsCorrect();
        $question['answers'][] = $answer;
        $index++;
    }

    $test_obj['questions'][$q->GetId()] = $question;
}

// Make test path
$target_count = round(count($question_ids) * $test->GetQuestionMultiplier());
$path = [];
while(count($path) < $target_count){
    foreach($question_ids as $id){
        $path[] = $id;
    }
}
shuffle($path);
$path = array_slice($path, 0, $target_count);
$test_obj['path'] = $path;

// Calculate total points
foreach($path as $qid){
    $total_points += $test_obj['questions'][$qid]['points'];
}
$test_obj['total_points'] = $total_points;

// Encode and send
$json = json_encode($test_obj);
echo($json);
?>
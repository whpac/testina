<?php
use \UEngine\Modules\Pages\PageManager;
PageManager::SetRenderer(new \Layout\ApiRenderer());

$input = file_get_contents("php://input");
$json = json_decode($input);

$question_id = $json->question_id;
if(!is_numeric($question_id)){
    Layout\ApiRenderer::ThrowError('Parametr question_id jest w niewłaściwym formacie.');
    return;
}

if(!is_numeric($json->test_id)){
    Layout\ApiRenderer::ThrowError('Parametr test_id jest w niewłaściwym formacie.');
    return;
}

$current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();

if($question_id > 0){
    // Check if this question is made by current user
    $question = new Entities\Question($question_id);

    $test = $question->GetTest();

    if(!$test->IsMadeByUser($current_user)){
        Layout\ApiRenderer::ThrowError('Nie możesz edytować cudzych pytań.');
        return;
    }

    $result = $question->Update($json->text, $json->type, $json->points, $json->points_counting, $json->max_typos);
    if(!$result){
        Layout\ApiRenderer::ThrowError('Nie udało się zmodyfikować pytania w bazie danych.');
        return;
    }
}else{
    $test = new Entities\Test($json->test_id);

    if(!$test->IsMadeByUser($current_user)){
        Layout\ApiRenderer::ThrowError('Nie możesz dodawać pytań do cudzego testu.');
        return;
    }

    try{
        $question = Entities\Question::Create($test, $json->text, $json->type, $json->points, $json->points_counting, $json->max_typos);
    }catch(Exception $e){
        Layout\ApiRenderer::ThrowError('Nie udało się zapisać pytania w bazie danych.');
        return;
    }
}

$ans_error = 0;
foreach($json->answers as $json_answer){
    if($json_answer->id < 0){
        try{
            Entities\Answer::Create($question, $json_answer->text, ['correct' => $json_answer->correct]);
        }catch(Exception $e){
            $ans_error++;
        }
    }else{
        $answer = new Entities\Answer($json_answer->id);
        $res = $answer->Update($json_answer->text, ['correct' => $json_answer->correct]);
        if(!res) $ans_error++;
    }
}

if($ans_error > 0){
    Layout\ApiRenderer::ThrowError('Nie udało się zapisać '.$ans_error.' odpowiedzi.');
    return;
}

$rem_error = 0;
foreach($json->removed_answers as $removed_answer_id){
    if($removed_answer_id < 0) continue;
    try{
        $answer = new Entities\Answer($removed_answer_id);
        if(!$answer->Remove()) $rem_error++;
    }catch(Exception $e){
        $rem_error++;
    }
}

if($rem_error > 0){
    Layout\ApiRenderer::ThrowError('Nie udało się usunąć '.$rem_error.' odpowiedzi.');
    return;
}

echo('{"is_success":true}');
?>
<?php
use \UEngine\Modules\Pages\PageManager;
PageManager::SetRenderer(new \Layout\ApiRenderer());

$input = file_get_contents("php://input");
$json = json_decode($input);

$question_id = $json->question_id;
if(!is_numeric($question_id)){
    Layout\ApiRenderer::ThrowError('Parametr id jest w niewłaściwym formacie.');
    return;
}

// Check if this question is made by current user
$question = new Entities\Question($question_id);

$test = $question->GetTest();
$current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();

if(!$test->IsMadeByUser($current_user)){
    Layout\ApiRenderer::ThrowError('Nie możesz edytować cudych pytań.');
    return;
}

$result = $question->Update($json->text, $json->type, $json->points, $json->points_counting);

if(!$result){
    Layout\ApiRenderer::ThrowError('Nie udało się zapisać pytania do bazy danych.');
    return;
}

echo('{"is_success":true}');
?>
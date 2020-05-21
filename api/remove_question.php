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

$current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();

// Check if this question is made by current user
$question = new Entities\Question($question_id);

$test = $question->GetTest();

if(!$test->IsMadeByUser($current_user)){
    Layout\ApiRenderer::ThrowError('Nie możesz usuwać cudzych pytań.');
    return;
}

$result = $question->Remove();
if(!$result){
    Layout\ApiRenderer::ThrowError('Nie udało się usunąć pytania z bazy danych.');
    return;
}

echo('{"is_success":true}');
?>
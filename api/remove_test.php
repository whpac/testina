<?php
use \UEngine\Modules\Pages\PageManager;
PageManager::SetRenderer(new \Layout\ApiRenderer());

$input = file_get_contents("php://input");
$json = json_decode($input);

$test_id = $json->test_id;
if(!is_numeric($test_id)){
    Layout\ApiRenderer::ThrowError('Parametr test_id jest w niewłaściwym formacie.');
    return;
}

$current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();

$test = new Entities\Test($test_id);

// Check if this test is made by current user
if(!$test->IsMadeByUser($current_user)){
    Layout\ApiRenderer::ThrowError('Nie możesz usunąć cudzego testu.');
    return;
}

$result = $test->Remove();
if(!$result){
    Layout\ApiRenderer::ThrowError('Nie udało się usunąć testu z bazy danych.');
    return;
}

echo('{"is_success":true}');
?>
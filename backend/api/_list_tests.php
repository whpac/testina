<?php
use \UEngine\Modules\Pages\PageManager;
PageManager::SetRenderer(new \Layout\ApiRenderer());

$current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();
$tests = Entities\Test::GetTestsCreatedByUser($current_user);
echo('{');
echo('"tests":[');
for($i=0; $i<count($tests); $i++){
    $test = $tests[$i];

    if($i > 0) echo(',');
    echo('{');
    echo('"id":'.$test->GetId().',');
    echo('"name":"'.$test->GetName().'",');
    echo('"question_count":'.count($test->GetQuestions()).',');
    echo('"question_multiplier":'.$test->GetQuestionMultiplier().',');
    echo('"creation_date":"'.$test->GetCreationDate()->format('d.m.Y H:i').'"');
    echo('}');
}
echo(']}');
?>
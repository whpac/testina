<?php
\UEngine\Modules\Pages\PageManager::GetRenderer()->AddBackArrow('testy/lista');
$assignment_id = $_GET[0];

try{
    $assignment = new Entities\Assignment($assignment_id);
}catch(Exception $e){
    \UEngine\Modules\Pages\PageManager::SetTitle('Test nie istnieje');
    ?>
    <h1>Test nie istnieje</h1>
    <div class="card">
        <h2 class="emoji center">🔍</h2>
        <p>
            Wskazany test nie istnieje.
        </p>
        <div class="card-buttons">
            <a class="button" href="testy/lista">Wróć do listy testów</a>
        </div>
    </div>
    <?php
    return;
}

$current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();

if(!$assignment->IsForUser($current_user)){
    \UEngine\Modules\Pages\PageManager::SetTitle('Brak dostępu');
    ?>
    <h1>Brak dostępu</h1>
    <div class="empty-placeholder">
        <img src="images/access_denied.svg" />
        <em>Nie masz dostępu do tego testu.</em>
        <p>
            <a href="testy/lista">Przejdź do listy testów</a>
        </p>
    </div>
    <?php
    return;
}

try{
    $test = $assignment->GetTest();
}catch(Exception $e){
    \UEngine\Modules\Pages\PageManager::SetTitle('Test nie istnieje');
    ?>
    <h1>Test nie istnieje</h1>
    <div class="card">
        <h2 class="emoji center">🔍</h2>
        <p>
            Wskazany test nie istnieje.
        </p>
        <div class="card-buttons">
            <a class="button" href="testy/lista">Wróć do listy testów</a>
        </div>
    </div>
    <?php
    return;
}

\UEngine\Modules\Pages\PageManager::SetTitle('Szczegóły: '.$test->GetName());

$attempt_count = $assignment->CountUserAttempts($current_user);
$attempts_left = $assignment->GetAttemptLimit() - $attempt_count;
?>
<h1><span class="secondary">Szczegóły:</span> <?php echo($test->GetName()); ?></h1>
<div class="card">
    <table class="table full-width">
        <tr><th></th><th></th></tr>
        <tr>
            <th>Termin rozwiązania</th>
            <td class="center"><?php echo($assignment->GetTimeLimit()->format('d.m. H:i')); ?></td>
        </tr>
        <tr>
            <th>Data przypisania</th>
            <td class="center"><?php echo($assignment->GetAssignmentDate()->format('d.m. H:i')); ?></td>
        </tr>
        <tr>
            <th>Twój wynik</th>
            <td class="center">
            <?php
            $score = $assignment->GetAverageScore($current_user);
            if(is_null($score)) echo('&mdash;');
            else echo('<a href="testy/wynik/'.$assignment->GetId().'" title="Zobacz szczegóły wyniku">'.$score.'%</a>');
            ?>
            </td>
        </tr>
        <tr>
            <th>Autor testu</th>
            <td class="center">Jan Kowalski</td>
        </tr>
        <tr>
            <th>Pozostało prób</th>
            <td class="center">
            <?php
                if($assignment->AreAttemptsUnlimited()) echo('brak ograniczeń');
                else echo($attempts_left);
            ?>
            </td>
        </tr>
    </table>
    <?php
    if($assignment->AreRemainingAttempts($current_user) && !$assignment->HasTimeLimitExceeded()){
        ?>
        <div class="card-buttons">
            <a class="button" href="testy/rozwiąż/<?php echo($test->GetId()); ?>">Rozwiąż</a>
        </div>
        <?php
    }
    ?>
</div>
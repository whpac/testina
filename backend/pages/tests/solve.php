<?php
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

\UEngine\Modules\Pages\PageManager::SetTitle('Rozwiąż: '.$test->GetName());

$attempt_count = $assignment->CountUserAttempts($current_user);
$attempts_left = $assignment->GetAttemptLimit() - $attempt_count;

$time_limit = '0:00';
$has_time_limit = false;

if($test->HasTimeLimit()){
    if($test->GetTimeLimit() > \Utils\DateTimeExt::DiffInSeconds($assignment->GetTimeLimit())){
        $time_limit = $assignment->GetTimeLimit()->format('d.m. H:i');
    }else{
        $time_limit = \Utils\DateTimeExt::SecondsToTime($test->GetTimeLimit());
        $has_time_limit = true;
    }
}else{
    $time_limit = $assignment->GetTimeLimit()->format('d.m. H:i');
}
?>
<script type="module">
import * as Tests from './js/tests';
</script>
<h1><span class="secondary">Rozwiąż:</span> <?php echo($test->GetName()); ?></h1>
<div class="card semi-wide" id="test-invitation">
    <h2 class="center"><?php echo($test->GetName()); ?></h2>
    <div class="test-summary">
        <span class="question-count"><?php echo($test->GetQuestionCount()); ?></span>
        <span class="question-count-text">pyta<?php echo(n($test->GetQuestionCount(), 'nie', 'nia', 'ń')); ?></span>
        <span class="time-limit"><?php echo($time_limit); ?></span>
        <span class="time-limit-text"><?php echo($has_time_limit ? 'limit czasu' : 'termin'); ?></span>
        <span class="remaining-attempts">
            <?php
                if($assignment->HasTimeLimitExceeded()) echo('Termin rozwiązania tego testu upłynął');
                elseif($assignment->AreAttemptsUnlimited()) echo('Do tego testu możesz podejść dowolną liczbę razy');
                elseif($attempts_left == 0) echo('Wykorzystał'.($current_user->IsFemale() ? 'a' : 'e').'ś już wszystkie podejścia');
                else echo('Pozostał'.n($attempts_left, 'o', 'y', 'o').' ci jeszcze '.$attempts_left.' podejś'.n($attempts_left, 'cie', 'cia', 'ć'));
            ?>
        </span>
        <div class="buttons">
            <a href="testy/lista" class="button big with-border exit-test">Wróć do listy</a>
            <?php
                if($assignment->AreRemainingAttempts($current_user) && !$assignment->HasTimeLimitExceeded())
                    echo('<button class="big with-border start-test" data-test-id="'.$assignment_id.'">Rozpocznij</button>');
            ?>
        </div>
    </div>
    <div id="test-loading-information" style="display:none">
        <div class="loading-test">Wczytywanie testu...</div>
        <div class="progress-indeterminate"></div>
    </div>
</div>
<div class="card semi-wide" id="question-wrapper" style="display:none">
    <div class="question-metadata">
        <span class="question-count">
            <span id="current-question-number">0</span>/<span id="question-count">70</span>
        </span>
        <span class="question-score"><span class="percentage-score">0</span>%</span>
        <span class="question-timer"><i class="fa fa-clock-o icon"></i> <span id="remaining-time">29:59</span></span>
    </div>
    <h2 class="question-text" id="question-text">
        Treść pytania
    </h2>
    <div class="question-answer-buttons" id="question-answer-field">
        <button class="answer-button">A</button>
        <button class="answer-button">B</button>
    </div>
    <div class="card-buttons">
        <button class="big with-border" id="check-button">Gotowe</button>
        <button class="big with-border" id="next-button" style="display:none">Następne pytanie</button>
        <button class="big with-border" id="end-button" style="display:none">Koniec</button>
    </div>
</div>
<div class="card semi-wide" id="after-test-message" style="display:none">
    <h2 class="center">
        Twój wynik: <span class="percentage-score">0</span>%.
    </h2>
    <span class="subtitle center" id="average-score-wrapper" style="visibility:hidden;">
        Uśredniony wynik ze wszystkich podejść: 
        <a href="testy/wynik/<?php echo($assignment_id); ?>"><span id="average-percentage-score">0</span>%</a>.
    </span>
    <div class="center">
        <a href="testy/lista" class="button big with-border">Wróć do listy testów</a>
    </div>
    <table id="out" class="table full-width">
        <tr><th>Pytanie</th><th>Punkty</th></tr>
    </table>
</div>
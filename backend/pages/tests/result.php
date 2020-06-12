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
    \UEngine\Modules\Pages\PageManager::GetRenderer()->AddBackArrow('testy/lista');
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
    \UEngine\Modules\Pages\PageManager::GetRenderer()->AddBackArrow('testy/lista');
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

\UEngine\Modules\Pages\PageManager::GetRenderer()->AddBackArrow('testy/szczegóły/'.$assignment_id);
\UEngine\Modules\Pages\PageManager::SetTitle('Wyniki: '.$test->GetName());

$attempts = $assignment->GetUserAttempts($current_user);
?>
<h1><span class="secondary">Wyniki:</span> <?php echo($test->GetName()); ?></h1>

<table class="table card auto-width">
    <tr>
        <th>Data rozpoczęcia</th>
        <th>Wynik</th>
    </tr>
    <?php
    foreach($attempts as $attempt){
        echo('<tr>');
        echo('<td class="center">'.$attempt->GetBeginTime()->format('d.m. H:i').'</td>');
        echo('<td class="center">'.$attempt->GetPercentageScore().'%</td>');
        echo('</tr>');
    }
    ?>
    <tr>
        <td class="center"><em>Średnia</em></td>
        <td class="center"><em><?php echo($assignment->GetAverageScore($current_user).'%'); ?></em></td>
    </tr>
</table>
<div class="card">
    <h2>
        <span class="wide-screen-only">Z podziałem na pytania</span>
        <span class="narrow-screen-only">Pytania</span>
    </h2>
    <p class="secondary">Wyświetlane wyniki są razem wzięte ze wszystkich podejść.</p>
    <table class="table full-width">
        <tr>
            <th>Treść pytania</th>
            <th>Punkty</th>
        </tr>
        <?php
        $question_results = [];

        foreach($attempts as $attempt){
            $user_answers = $attempt->GetUserAnswers();
            $answered_questions = $user_answers->GetAnsweredQuestions();

            foreach($answered_questions as $question){
                $answer_sets = $user_answers->GetAnswersByQuestion($question);

                foreach($answer_sets as $answer_set){
                    if(!isset($question_results[$question->GetId()])){
                        $question_results[$question->GetId()] = [
                            $question->GetText(),
                            null, /* Wynik */
                            null  /* Maksimum */
                        ];
                    }
                    $question_results[$question->GetId()][1] += $question->CountPoints($answer_set);
                    $question_results[$question->GetId()][2] += $question->GetPoints();
                }
            }
        }

        foreach($question_results as $question){
            echo('<tr>');
            echo('<td>'.$question[0].'</td>');
            echo('<td class="center">'.$question[1].'/'.$question[2].'</td>');
            echo('</tr>');
        }
        ?>
    </table>
</div>
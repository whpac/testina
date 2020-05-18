<?php
\UEngine\Modules\Pages\PageManager::SetTitle('Testy');

$current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();
$assignments = Entities\Assignment::GetAssignmentsForUser($current_user);

$active_assignments = [];
$inactive_assignments = [];

foreach($assignments as $assignment){
    if($assignment->HasTimeLimitExceeded())
        $inactive_assignments[] = $assignment;
    elseif(!$assignment->AreRemainingAttempts($current_user))
        $inactive_assignments[] = $assignment;
    else
        $active_assignments[] = $assignment;
}
?>
<h1>Testy</h1>
<?php
if(count($active_assignments) > 0){
?>
<div class="card semi-wide">
    <h2>Do rozwiązania</h2>
    <div class="overflow-container-x">
        <table class="table full-width">
            <tr>
                <th>Nazwa</th>
                <th>Termin</th>
                <th class="wide-screen-only">Przypisano</span></th>
                <th class="wide-screen-only">Autor</span></th>
                <th class="wide-screen-only">Wynik</span></th>
                <th class="wide-screen-only">Prób</span></th>
                <th></th>
            </tr>
            <?php
            foreach($active_assignments as $assignment){
                $test = $assignment->GetTest();
                echo('<tr>');
                echo('<td>'.$test->GetName().'</td>');
                echo('<td class="center">'.$assignment->GetTimeLimit()->format('d.m. H:i').'</td>');
                echo('<td class="center wide-screen-only" title="'.$assignment->GetAssignmentDate()->format('d.m. H:i:s').'">');
                echo($assignment->GetAssignmentDate()->format('d.m.').'</td>');
                echo('<td class="center wide-screen-only">'.$test->GetAuthor()->GetFullName().'</td>');

                echo('<td class="center wide-screen-only">');
                $score = $assignment->GetAverageScore($current_user);
                if(is_null($score)) echo('&mdash;');
                else echo('<a href="testy/wynik/'.$assignment->GetId().'" title="Zobacz szczegóły wyniku">'.$score.'%</a>');
                echo('</td>');

                echo('<td class="center wide-screen-only">');
                $attempt_count = $assignment->CountUserAttempts($current_user);
                echo($attempt_count);
                if(!$assignment->AreAttemptsUnlimited()) echo('/'.$assignment->GetAttemptLimit());
                echo('</td>');

                echo('<td class="center">');
                echo('    <a class="button narrow-screen-only" href="testy/szczegóły/'.$assignment->GetId().'" title="Szczegóły"><i class="fa fa-ellipsis-h"></i></a>');
                
                if($assignment->AreRemainingAttempts($current_user))
                    echo('    <a class="button compact wide-screen-only" href="testy/rozwiąż/'.$assignment->GetId().'">Rozwiąż</a>');
                
                echo('</td>');
                echo('</tr>');
            }
            ?>
            <tr>
                <td>Lorem Ipsum</td>
                <td class="center">01.05.</td>
                <td class="center wide-screen-only">11.03.</td>
                <td class="center wide-screen-only">Jan Kowalski</td>
                <td class="center wide-screen-only"><a href="testy/wynik" title="Zobacz szczegóły wyniku">64%</a></td>
                <td class="center wide-screen-only">1/2</td>
                <td class="center">
                    <a class="button narrow-screen-only" href="#" title="Szczegóły"><i class="fa fa-ellipsis-h"></i></a>
                    <a class="button compact wide-screen-only" href="testy/rozwiąż">Rozwiąż</a>
                </td>
            </tr>
        </table>
    </div>
</div>
<?php
}
if(count($assignments) == 0){
?>
<div class="empty-placeholder">
    <img src="images/access_denied.svg" />
    <em>Nie masz żadnych testów</em>
    Nie oznacza to, że zawsze tak będzie <span class="emoji">🙃</span>
</div>
<?php
}elseif(count($active_assignments) == 0){
?>
<div class="empty-placeholder">
    <img src="images/all_tests_solved.svg" />
    <em>Rozwiązał<?php echo($current_user->IsFemale() ? 'a' : 'e'); ?>ś już wszystkie testy</em>
    Czas odpocząć! <span class="emoji">🌴</span>
</div>
<?php
}
if(count($inactive_assignments) > 0){
?>
<div class="card semi-wide">
    <h2>Już rozwiązane</h2>
    <p class="secondary">
        Tutaj wyświetlane są te testy, które już rozwiązał<?php echo($current_user->IsFemale() ? 'a' : 'e'); ?>ś,
        oraz te, których termin ukończenia minął.
    </p>
    <div class="overflow-container-x">
        <table class="table full-width">
            <tr>
                <th>Nazwa</th>
                <th>Wynik</th>
                <th class="wide-screen-only">Przypisano</th>
                <th class="wide-screen-only">Termin</th>
                <th class="wide-screen-only">Autor</th>
                <th class="wide-screen-only">Prób</th>
                <th class="narrow-screen-only"></th>
            </tr>
            <?php
            foreach($inactive_assignments as $assignment){
                $test = $assignment->GetTest();
                echo('<tr>');
                echo('<td>'.$test->GetName().'</td>');

                echo('<td class="center">');
                $score = $assignment->GetAverageScore($current_user);
                if(is_null($score)) echo('&mdash;');
                else echo('<a href="testy/wynik/'.$assignment->GetId().'" title="Zobacz szczegóły wyniku">'.$score.'%</a>');
                echo('</td>');

                echo('<td class="center wide-screen-only" title="'.$assignment->GetAssignmentDate()->format('d.m. H:i:s').'">');
                echo($assignment->GetAssignmentDate()->format('d.m.').'</td>');
                echo('<td class="center wide-screen-only"  title="'.$assignment->GetTimeLimit()->format('d.m. H:i').'">');
                echo($assignment->GetTimeLimit()->format('d.m.').'</td>');
                echo('<td class="center wide-screen-only">'.$test->GetAuthor()->GetFullName().'</td>');
                echo('<td class="center wide-screen-only">');

                $attempt_count = $assignment->CountUserAttempts($current_user);
                echo($attempt_count);
                if(!$assignment->AreAttemptsUnlimited()) echo('/'.$assignment->GetAttemptLimit());
                
                echo('</td>');
                echo('<td class="center narrow-screen-only">');
                echo('    <a class="button" href="testy/szczegóły/'.$assignment->GetId().'" title="Szczegóły"><i class="fa fa-ellipsis-h"></i></a>');
                echo('</td>');
                echo('</tr>');
            }
            ?>
            <tr>
                <td>Lorem Ipsum</td>
                <td class="center"><a href="#" title="Zobacz szczegóły wyniku">64%</a></td>
                <td class="center wide-screen-only">11.03.</td>
                <td class="center wide-screen-only">01.05.</td>
                <td class="center wide-screen-only">Jan Kowalski</td>
                <td class="center wide-screen-only">1/2</td>
                <td class="center narrow-screen-only">
                    <a class="button" href="#" title="Szczegóły"><i class="fa fa-ellipsis-h"></i></a>
                </td>
            </tr>
        </table>
    </div>
</div>
<?php
}
?>
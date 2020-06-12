<?php
$current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();

if(!isset($_GET[0])){
    // create a new test
    $test = Entities\Test::Create($current_user);
    $test_id = $test->GetId();
}else{
    $test_id = $_GET[0];

    try{
        $test = new Entities\Test($test_id);
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

    if(!$test->IsMadeByUser($current_user)){
        \UEngine\Modules\Pages\PageManager::SetTitle('Brak dostępu');
        ?>
        <h1>Brak dostępu</h1>
        <div class="empty-placeholder">
            <img src="images/access_denied.svg" />
            <em>Nie masz dostępu do tego testu.</em>
            <p>
                Możesz edytować wyłącznie swoje testy.
            </p>
            <p>
                <a href="testy/lista">Przejdź do listy testów</a>
            </p>
        </div>
        <?php
        return;
    }
}

\UEngine\Modules\Pages\PageManager::SetTitle('Edycja: '.$test->GetName());

$questions = $test->GetQuestions();
?>
<h1><span class="secondary">Edycja:</span> <span id="heading-test-title"><?php echo($test->GetName()); ?></span></h1>
<div class="card">
    <h2>Pytania</h2>
    <table class="table full-width">
        <colgroup>
            <col class="shrink" />
            <col />
            <col class="shrink" />
            <col class="shrink" />
            <col class="shrink" />
        </colgroup>
        <tr>
            <th></th>
            <th>Treść</th>
            <th>Punkty</th>
            <th></th>
            <th></th>
        </tr>
        <tbody class="content-tbody" id="questions-tbody"><?php
            $i = 1;
            foreach($questions as $question){
                echo('<tr data-row-number="'.$i.'" data-question-id="'.$question->GetId().'">');
                echo('<td class="secondary">'.$i.'.</td>');
                echo('<td>'.Utils\String::Truncate($question->GetText(), 60).'</td>');
                echo('<td class="center">'.$question->GetPoints().'</td>');
                echo('<td><button class="compact event-edit-question" data-question-id="'.$question->GetId().'">Edytuj</button></td>');
                echo('<td><button class="compact error fa fa-trash event-remove-question" data-question-id="'.$question->GetId().'" title="Usuń pytanie"></button></td>');
                echo('</tr>');
                $i++;
            }
      ?></tbody>
        <tbody class="nocontent-tbody">
            <tr>
                <td></td>
                <td><i class="secondary">Nie ma jeszcze żadnych pytań</i></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        </tbody>
    </table>
    <div class="center">
        <button id="add-question-button">Dodaj pytanie</button>
    </div>
</div>

<div class="card">
    <h2>Ustawienia testu</h2>
    <div class="grid-form">
        <label for="question-name-input">Nazwa:</label>
        <input id="question-name-input" type="text" class="narrow event-made-changes-to-settings" value="<?php echo($test->GetName()); ?>" />
        <label for="question-multiplier">Mnożnik pytań:</label>
        <span>
            <input id="question-multiplier" class="event-made-changes-to-settings" type="number" value="<?php echo($test->GetQuestionMultiplier()); ?>" step="any" min="0" />
            <a class="get-help todo fa fa-question-circle" href="pomoc" title="Pomoc" target="_blank"></a>
        </span>
        <p class="description secondary">
            Ta wartość oznacza, ile razy każde pytanie zostanie wyświetlone użytkownikowi.
            Szczegółowy opis znajduje się w <a href="pomoc" class="todo" target="_blank">artykule pomocy</a>.
        </p>
        <div class="fieldset">
            Limit czasu na podejście <a class="get-help todo fa fa-question-circle" href="pomoc" title="Pomoc" target="_blank"></a><br />
            <input type="radio" name="time-limit" id="with-time-limit" class="event-update-test-time-limit" <?php if($test->HasTimeLimit()) echo('checked'); ?> />
            <input type="number" id="set-time-limit" min="1" class="event-made-changes-to-settings" <?php echo($test->HasTimeLimit() ? ('value="'.($test->GetTimeLimit() / 60).'"') : 'value="15" disabled'); ?> />
            <label for="set-time-limit">minut</label><br />
            <input type="radio" name="time-limit" id="no-time-limit" class="event-update-test-time-limit" <?php if(!$test->HasTimeLimit()) echo('checked'); ?> />
            <label for="no-time-limit">Brak limitu</label>
        </div>
    </div>
    <div class="card-buttons">
        <button id="save-test-settings-button">Zapisz</button>
        <button class="error" id="remove-test-button">Usuń test</button>
    </div>
</div>

<script type="module">
    import * as TestEditor from './js/testeditor';
    $(function(){
        let test_id = <?php echo($test->GetId()); ?>;
        TestEditor.LoadQuestions(test_id, {
<?php
for($i=0; $i<count($questions); $i++){
    $question = $questions[$i];
    echo($question->GetId().': {');
    echo('id: '.$question->GetId().',');
    echo('text: "'.$question->GetText().'",');
    echo('type: '.$question->GetType().',');
    echo('points: '.$question->GetPoints().',');
    echo('points_counting: '.$question->GetPointsCounting().',');
    echo('max_typos: '.$question->GetMaxNumberOfTypos().',');
    echo('persistent: true,');

    echo('answers: [');
    $answers = $question->GetAnswers();
    for($j=0; $j<count($answers); $j++){
        $answer = $answers[$j];
        echo('{');
        echo('id: '.$answer->GetId().',');
        echo('text: "'.$answer->GetText().'",');
        echo('correct: '.($answer->IsCorrect() ? 'true' : 'false'));
        echo('}');
        if($j < count($answers) - 1) echo(',');
    }
    echo(']');

    echo('}');
    if($i < count($questions) - 1) echo(',');
}
?>
        });
    });
</script>

<div class="dialog rich" id="question-dialog">
    <h2>
        Edytuj pytanie
        <a href="pomoc" class="get-help todo" title="Pomoc" target="_blank">
            <i class="fa fa-question-circle"></i>
        </a>
    </h2>
    <div class="content">
        <div class="grid-form">
            <label for="question-text">Treść:</label>
            <textarea rows="3" id="question-text" class="event-edit-question-made-changes"></textarea>
            <label for="question-type">Rodzaj:</label>
            <select id="question-type" onchange="TestEditor.EditQuestionDialog.OnQuestionTypeChange()">
                <option value="0">Jednokrotnego wyboru</option>
                <option value="1">Wielokrotnego wyboru</option>
                <option value="2">Otwarte</option>
            </select>
            <label for="points">Liczba punktów:</label>
            <input type="number" min="0" step="any" id="points" class="narrow event-edit-question-made-changes" />
            <div class="fieldset" id="points-counting-fieldset">
                Sposób liczenia punktów:
                <a href="pomoc" class="get-help todo" target="_blank"><i class="fa fa-question-circle"></i></a>
                <br />
                <input type="radio" name="points-counting" id="points-counting-binary" class="event-edit-question-made-changes" />
                <label for="points-counting-binary">Zero-jedynkowo</label><br />
                <input type="radio" name="points-counting" id="points-counting-linear" class="event-edit-question-made-changes" />
                <label for="points-counting-linear">Po ułamku za każdą poprawną odpowiedź</label>
            </div>
            <div class="fieldset" id="typos-fieldset">
                Literówki:<br />
                <input type="radio" name="typos" id="typos-disallow" class="event-edit-question-made-changes" />
                <label for="typos-disallow">Nie toleruj</label><br />
                <input type="radio" name="typos" id="typos-allow" class="event-edit-question-made-changes" />
                <label for="typos-allow">Toleruj tyle literówek: <input type="number" id="typos-allow-count" step="1" min="0" class="event-edit-question-made-changes" /></label>
            </div>
        </div>
        <hr class="spaced" />
        <table class="table full-width">
            <colgroup>
                <col class="shrink" />
                <col />
                <col class="shrink" />
                <col class="shrink" />
            </colgroup>
            <tbody>
                <tr>
                    <th></th>
                    <th>Odpowiedzi</th>
                    <th>Poprawna</th>
                    <th></th>
                </tr>
            </tbody>
            <tbody class="content-tbody" id="answers-tbody"></tbody>
            <tbody class="nocontent-tbody">
                <tr>
                    <td></td>
                    <td><i class="secondary">Nie ma żadnych odpowiedzi</i></td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
            <tbody>
                <tr>
                    <td></td>
                    <td>
                        <button class="compact" id="add-answer-button">Dodaj</button>
                    </td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
        </table>
        <div class="error" id="edit-question-error"></div>
    </div>
    <div class="buttons">
        <button id="save-question-button">Zapisz</button>
        <button class="secondary" id="cancel-question-changes-button">Anuluj</button>
    </div>
</div>
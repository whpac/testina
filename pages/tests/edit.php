<?php
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

$current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();

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

\UEngine\Modules\Pages\PageManager::SetTitle('Edycja: '.$test->GetName());

$questions = $test->GetQuestions();
?>
<h1><span class="secondary">Edycja:</span> <?php echo($test->GetName()); ?></h1>
<div class="card">
    <h2>Pytania</h2>
    <table class="table full-width">
        <colgroup>
            <col class="shrink" />
            <col />
            <col class="shrink" />
            <col class="shrink" />
        </colgroup>
        <tr>
            <th></th>
            <th>Treść</th>
            <th>Punkty</th>
            <th></th>
        </tr>
        <?php
        $i = 1;
        foreach($questions as $question){
            echo('<tr>');
            echo('<td class="secondary">'.$i.'.</td>');
            echo('<td>'.Utils\String::Truncate($question->GetText(), 60).'</td>');
            echo('<td class="center">'.$question->GetPoints().'</td>');
            echo('<td><button class="compact todo" onclick="TestEditor.EditQuestion('.$question->GetId().');">Edytuj</button></td>');
            echo('</tr>');
            $i++;
        }
        ?>
    </table>
    <div class="center">
        <button class="todo">Dodaj pytanie</button>
    </div>
</div>

<div class="card">
    <h2 class="todo">Ustawienia testu</h2>
    Limit czasu na podejście, mnożnik pytań, nazwa
</div>

<script>
    $(function(){
        TestEditor.LoadQuestions({
<?php
for($i=0; $i<count($questions); $i++){
    $question = $questions[$i];
    echo($question->GetId().': {');
    echo('id: '.$question->GetId().',');
    echo('text: "'.$question->GetText().'",');
    echo('type: '.$question->GetType().',');
    echo('points: '.$question->GetPoints().',');
    echo('points_counting: '.$question->GetPointsCounting().',');

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
        <a href="pomoc" class="get-help" title="Pomoc" target="_blank">
            <i class="fa fa-question-circle"></i>
        </a>
    </h2>
    <div class="content">
        <div class="grid-form">
            <label for="question-text">Treść:</label>
            <textarea rows="3" id="question-text"></textarea>
            <label for="question-type">Rodzaj:</label>
            <select id="question-type">
                <option value="0">Jednokrotnego wyboru</option>
                <option value="1">Wielokrotnego wyboru</option>
            </select>
            <label for="points">Liczba punktów:</label>
            <input type="text" id="points" class="narrow" size="4" />
            <div class="fieldset">
                Sposób liczenia punktów:
                <a href="pomoc" class="get-help" target="_blank"><i class="fa fa-question-circle"></i></a>
                <br />
                <input type="radio" name="points-counting" id="points-counting-binary" />
                <label for="points-counting-binary">Zero-jedynkowo</label><br />
                <input type="radio" name="points-counting" id="points-counting-linear" />
                <label for="points-counting-linear">Po ułamku za każdą poprawną odpowiedź</label>
            </div>
        </div>
        <hr class="spaced" />
        <table class="table full-width">
            <colgroup>
                <col class="shrink" />
                <col />
                <col class="shrink" />
            </colgroup>
            <tbody>
                <tr>
                    <th></th>
                    <th>Odpowiedzi</th>
                    <th>Poprawna</th>
                </tr>
                <tr>
                    <td></td>
                    <td><i class="secondary">Nie ma żadnych odpowiedzi</i></td>
                    <td></td>
                </tr>
            </tbody>
            <tbody id="answers-tbody">
            </tbody>
            <tbody>
                <tr>
                    <td></td>
                    <td>
                        <button class="compact">Dodaj</button>
                    </td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="buttons">
        <button class="todo">Zapisz</button>
        <button class="secondary" onclick="TestEditor.EditQuestionDialog.Hide()">Anuluj</button>
    </div>
</div>
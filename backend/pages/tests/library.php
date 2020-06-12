<?php
\UEngine\Modules\Pages\PageManager::SetTitle('Biblioteka testów');

$current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();
$tests = Entities\Test::GetTestsCreatedByUser($current_user);
?>
<script type="module">
import * as Library from './js/library';
</script>
<h1>Biblioteka testów</h1>
<div class="card semi-wide">
    <a class="button header-button" href="testy/utwórz"><i class="fa fa-plus icon"></i><span>Utwórz nowy</span></a>
    <h2>Moje testy</h2>
    <p class="secondary">Tutaj wyświetlane są wszystkie stworzone przez Ciebie testy.</p>
    <table class="table full-width">
        <colgroup>
            <col />
            <col />
            <col />
            <col class="shrink" />
            <col class="shrink" />
            <col class="shrink" />
        </colgroup>
        <tr>
            <th>Nazwa testu</th>
            <th class="center wide-screen-only">Ilość pytań</th>
            <th class="center wide-screen-only">Data utworzenia</th>
            <th class="wide-screen-only"></th>
            <th class="wide-screen-only"></th>
            <th class="narrow-screen-only"></th>
        </tr>
        <?php
        foreach($tests as $test){
            echo('<tr>');
            echo('<td>'.$test->GetName().'</td>');
            echo('<td class="center wide-screen-only">'.count($test->GetQuestions()).' (×'.$test->GetQuestionMultiplier().')</td>');
            echo('<td class="center wide-screen-only">'.$test->GetCreationDate()->format('d.m.Y H:i').'</td>');
            echo('<td class="wide-screen-only"><button class="compact todo">Przypisz</button></td>');
            echo('<td class="wide-screen-only"><a class="button compact" href="testy/edytuj/'.$test->GetId().'">Edytuj</a></td>');
            echo('<td class="narrow-screen-only right"><button class="event-display-question-summary"><i class="fa fa-ellipsis-h"></i></button>');
            echo('</td>');
            echo('</tr>');
        }
        ?>
    </table>
</div>

<div class="dialog" id="question-summary-dialog">
    <div class="content">
        <table class="table full-width center">
            <tr><th></th><th></th></tr>
            <tr><td>Ilość pytań</td><td>0</td></tr>
            <tr><td>Data utworzenia</td><td>1.01.1970</td></tr>
        </table>
    </div>
    <div class="buttons">
        <button class="event-hide-question-summary">Zamknij</button>
        <button class="secondary">Przypisz</button>
        <button class="secondary">Edytuj</button>
    </div>
</div>

<div class="dialog rich" id="assign-dialog">
    <h2>Przypisz test</h2>
    <div class="content">
        <section>
            <p class="secondary">
                Wybierz osoby lub grupy, którym test ma zostać przypisany
            </p>
            <table class="table full-width">
                <col class="shrink" />
                <col />
                <col class="shrink" />
                <thead>
                    <tr>
                        <th></th><th></th><th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><button onclick="$('#group1').toggle()">+</button></td><td>Grupa 1</td><td class="right"><input type="checkbox" /></td>
                    </tr>
                </tbody>
                <tbody id="group1" style="display:none">
                    <tr><td></td><td>1</td><td></td></tr>
                    <tr><td></td><td>2</td><td></td></tr>
                    <tr><td></td><td>3</td><td></td></tr>
                    <tr><td></td><td>4</td><td></td></tr>
                </tbody>
                <tbody>
                    <tr>
                        <td><button onclick="$('#group1').toggle()">+</button></td><td>Grupa 2</td><td class="right"><input type="checkbox" /></td>
                    </tr>
                </tbody>
            </table>
        </section>
        <section>
            <p class="secondary">
                Ustaw limit prób oraz termin wykonania testu<br/>
                <img src="images/file_not_found.svg" /><br/>
                <img src="images/file_not_found.svg" /><br/>
                <img src="images/file_not_found.svg" /><br/>
                <img src="images/file_not_found.svg" /><br/>
            </p>
        </section>
    </div>
    <div class="buttons">
        <button onclick="Dialogs.HideDialog('assign-dialog')" disabled>Zapisz</button>
        <button onclick="Dialogs.HideDialog('assign-dialog')" class="secondary">Anuluj</button>
    </div>
</div>
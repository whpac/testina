<?php
\UEngine\Modules\Pages\PageManager::SetTitle('Biblioteka testów');

$current_user = \UEngine\Modules\Auth\AccessControl\AuthManager::GetCurrentUser();
$tests = Entities\Test::GetTestsCreatedByUser($current_user);
?>
<h1>Biblioteka testów</h1>
<div class="card semi-wide">
    <a class="button header-button todo" href="testy/utwórz"><i class="fa fa-plus icon"></i><span>Utwórz nowy</span></a>
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
        <tr>
            <td>Lorem ipsum</td>
            <td class="center wide-screen-only">5</td>
            <td class="center wide-screen-only">01.04. 12:34</td>
            <td class="wide-screen-only"><button class="compact todo" onclick="Dialogs.ShowDialog('assign-dialog')">Przypisz</button></td>
            <td class="wide-screen-only"><a class="button compact todo">Edytuj</a></td>
            <td class="narrow-screen-only right"><button><i class="fa fa-ellipsis-h"></i></button></td>
        </tr>
        <?php
        foreach($tests as $test){
            echo('<tr>');
            echo('<td>'.$test->GetName().'</td>');
            echo('<td class="center wide-screen-only">'.count($test->GetQuestions()).' (×'.$test->GetQuestionMultiplier().')</td>');
            echo('<td class="center wide-screen-only">'.$test->GetCreationDate()->format('d.m.Y H:i').'</td>');
            echo('<td class="wide-screen-only"><button class="compact">Przypisz</button></td>');
            echo('<td class="wide-screen-only"><a class="button compact" href="testy/edytuj/'.$test->GetId().'">Edytuj</a></td>');
            echo('<td class="narrow-screen-only right"><button onclick="');
            echo('Library.DisplaySummaryDialog('.$test->GetId().', \''.$test->GetName().'\', '.$test->GetQuestionCount().', \''.$test->GetCreationDate()->format('d.m.Y H:i').'\')');
            echo('"><i class="fa fa-ellipsis-h"></i></button>');
            echo('</td>');
            echo('</tr>');
        }
        ?>
    </table>
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
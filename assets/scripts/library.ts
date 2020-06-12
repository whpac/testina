import * as Dialogs from './dialogs';

import { $Handles } from './eventhandlers';
import { GetElement } from './functions';
import { Hide } from './dialog_backdrop';

class QuestionSummaryDialog{
    DialogElement: HTMLElement;

    constructor(){
        this.DialogElement = GetElement('question-summary-dialog');
    }

    Show(){
        Dialogs.ShowDialog(this.DialogElement);
    }

    Hide(){
        Dialogs.HideDialog(this.DialogElement);
    }
}

let Dialog = new QuestionSummaryDialog();

$Handles('.event-display-question-summary', 'click', DisplaySummaryDialog);
function DisplaySummaryDialog(){
    Dialog.Show();
}

$Handles('.event-hide-question-summary', 'click', HideSummaryDialog);
function HideSummaryDialog(){
    Dialog.Hide();
}

function DisplaySummaryDialog2(test_id: number, test_name: string, question_count: string, creation_date: string){
    let content = document.createElement('table');
    content.classList.add('table', 'full-width', 'center');

    let table_html = '<tr><th></th><th></th></tr>';
    table_html += '<tr><td>Ilość pytań</td><td>' + question_count + '</td></tr>';
    table_html += '<tr><td>Data utworzenia</td><td>' + creation_date + '</td></tr>';
    content.innerHTML = table_html;

    let dialog = Dialogs.CreateDialog();
    dialog.SetHeader(test_name);
    dialog.AddContent(content);
    dialog.AddButton('Zamknij', () => {dialog.Hide();});
    dialog.AddButton('Edytuj', () => {window.location.href = 'testy/edytuj/' + test_id}, ['secondary']);
    dialog.AddButton('Przypisz', () => {
        dialog.Hide();
        AssignTest(test_id, test_name);
    }, ['secondary']);
    dialog.Show();
}

function AssignTest(test_id: number, test_name: string){

}
var Library = {

    DisplaySummaryDialog: function(test_id, test_name, question_count, creation_date){
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
        dialog.AddButton('Edytuj', () => {window.location = 'testy/edytuj/' + test_id}, ['secondary']);
        dialog.AddButton('Przypisz', () => {
            dialog.Hide();
            Library.AssignTest(test_id, test_name);
        }, ['secondary']);
        dialog.Show();
    },

    AssignTest: function(test_id, test_name){

    }
}
import Component from '../../basic/component';
import User from '../../../entities/user';

export default class UsersTable extends Component {
    protected SearchField: HTMLInputElement;
    protected UsersTBody: HTMLTableSectionElement;
    protected SearchEmptyTBody: HTMLTableSectionElement;
    protected AreUsersPopulated: boolean = false;

    constructor(){
        super();

        this.SearchField = document.createElement('input');
        this.SearchField.classList.add('search-field');
        this.SearchField.type = 'text';
        this.SearchField.placeholder = 'Wyszukaj...';
        this.SearchField.addEventListener('keyup', this.OnSearchKeyUp.bind(this));
        this.AppendChild(this.SearchField);

        this.AppendChild(document.createTextNode('Osoby | Grupy'));

        let table_wrapper = document.createElement('div');
        table_wrapper.classList.add('overflow-container-y');
        this.AppendChild(table_wrapper);

        let users_table = document.createElement('table');
        users_table.classList.add('table', 'full-width');
        table_wrapper.appendChild(users_table);

        this.UsersTBody = users_table.createTBody();
        this.SearchEmptyTBody = users_table.createTBody();

        this.SearchEmptyTBody.style.display = 'none';
        let search_empty_tr = this.SearchEmptyTBody.insertRow(-1);
        search_empty_tr.insertCell(-1);
        let text_search_empty_cell = search_empty_tr.insertCell(-1);
        text_search_empty_cell.textContent = 'Nie znaleziono żądanych użytkowników';
        text_search_empty_cell.classList.add('secondary');

        let colgroup = document.createElement('colgroup');
        let col_shrink = document.createElement('col');
        col_shrink.classList.add('shrink');
        colgroup.appendChild(col_shrink);
        users_table.appendChild(colgroup);
        colgroup.appendChild(document.createElement('col'));

        let tr_head = users_table.createTHead().insertRow(-1);
        tr_head.appendChild(document.createElement('th'));
        tr_head.appendChild(document.createElement('th'));

        let selected_users_count_text = document.createElement('p');
        selected_users_count_text.classList.add('small-margin');
        selected_users_count_text.textContent = 'Wybrano 0 osób.';
        this.AppendChild(selected_users_count_text);
    }

    async Populate(){
        if(this.AreUsersPopulated) return;
        this.UsersTBody.textContent = '';

        let users = await User.GetAll();
        for(let user of users){
            let tr = this.UsersTBody.insertRow(-1);
            
            let checkbox_cell = tr.insertCell(-1);
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox_cell.appendChild(checkbox);
            
            let user_name = await user.GetName();
            tr.dataset.userName = user_name;
            tr.insertCell(-1).textContent = user_name;
        }
    }

    protected OnSearchKeyUp(){
        let search_query = this.SearchField.value.toLowerCase();
        let rows = this.UsersTBody.rows;
        let found = 0;
        for(let i = 0; i < rows.length; i++){
            let user_name = rows[i].dataset.userName ?? '';
            user_name = user_name.toLowerCase();
            if(user_name.includes(search_query)){
                rows[i].style.display = '';
                found++;
            }else{
                rows[i].style.display = 'none';
            }
        }

        this.SearchEmptyTBody.style.display = (found > 0) ? 'none' : '';
    }
}
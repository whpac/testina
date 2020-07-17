import Component from '../../basic/component';
import User from '../../../entities/user';

export default class UsersTable extends Component {
    protected Element: HTMLTableElement;
    protected UsersTBody: HTMLTableSectionElement;
    protected SearchEmptyTBody: HTMLTableSectionElement;
    protected AreUsersPopulated: boolean = false;

    constructor(){
        super();

        this.Element = document.createElement('table');
        this.Element.classList.add('table', 'full-width');

        this.UsersTBody = this.Element.createTBody();
        this.SearchEmptyTBody = this.Element.createTBody();

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
        this.Element.appendChild(colgroup);
        colgroup.appendChild(document.createElement('col'));

        let tr_head = this.Element.createTHead().insertRow(-1);
        tr_head.appendChild(document.createElement('th'));
        tr_head.appendChild(document.createElement('th'));
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

    Filter(search_query: string){
        search_query = search_query.toLowerCase();
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
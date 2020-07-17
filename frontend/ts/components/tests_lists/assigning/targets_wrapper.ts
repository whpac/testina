import Component from '../../basic/component';
import Tab from '../../basic/tabs/tab';
import TabContainer from '../../basic/tabs/tab_container';
import UsersTable from './users_table';
import GroupsTable from './groups_table';

type TargetType = 'user' | 'group';

export default class TargetsWrapper extends Component {
    protected SearchField: HTMLInputElement;
    protected UsersTable: UsersTable;
    protected GroupsTable: GroupsTable;
    protected CurrentlyDisplayedTargetType!: TargetType;

    constructor(){
        super();

        let search_tabs = document.createElement('div');
        search_tabs.classList.add('search-and-tabs');
        this.AppendChild(search_tabs);

        this.SearchField = document.createElement('input');
        this.SearchField.classList.add('search-field');
        this.SearchField.type = 'text';
        this.SearchField.placeholder = 'Wyszukaj...';
        this.SearchField.addEventListener('keyup', this.FilterTable.bind(this));
        search_tabs.appendChild(this.SearchField);

        let tab_container = new TabContainer();
        search_tabs.appendChild(tab_container.GetElement());

        let users_tab = new Tab('Osoby');
        users_tab.AddOnSelectListener((() => this.SwitchTargetType('user')).bind(this));
        tab_container.AddTab(users_tab);

        let groups_tab = new Tab('Grupy');
        groups_tab.AddOnSelectListener((() => this.SwitchTargetType('group')).bind(this));
        tab_container.AddTab(groups_tab);

        let table_wrapper = document.createElement('div');
        table_wrapper.classList.add('overflow-container-y');
        this.AppendChild(table_wrapper);

        this.UsersTable = new UsersTable();
        table_wrapper.appendChild(this.UsersTable.GetElement());
        this.GroupsTable = new GroupsTable();
        table_wrapper.appendChild(this.GroupsTable.GetElement());

        let selected_users_count_text = document.createElement('p');
        selected_users_count_text.classList.add('small-margin');
        selected_users_count_text.textContent = 'Wybrano 0 osób i 0 grup.';
        this.AppendChild(selected_users_count_text);
    }

    async Populate(){
        this.SearchField.value = '';
        this.SwitchTargetType('user');
        
        let users_awaiter = this.UsersTable.Populate();
        let groups_awaiter = this.GroupsTable.Populate();
        await users_awaiter;
        await groups_awaiter;

        this.FilterTable();
    }

    protected SwitchTargetType(new_target: TargetType){
        this.UsersTable.GetElement().style.display = 'none';
        this.GroupsTable.GetElement().style.display = 'none';

        this.CurrentlyDisplayedTargetType = new_target;
        switch(new_target){
            case 'user':
                this.UsersTable.GetElement().style.display = '';
                break;
            case 'group':
                this.GroupsTable.GetElement().style.display = '';
                break;
        }
        this.FilterTable();
    }

    protected FilterTable(){
        let search_query = this.SearchField.value.toLowerCase();

        switch(this.CurrentlyDisplayedTargetType){
            case 'user':
                this.UsersTable.Filter(search_query);
                break;
            case 'group':
                this.GroupsTable.Filter(search_query);
                break;
        }
    }
}
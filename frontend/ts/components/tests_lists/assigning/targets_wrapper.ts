import Component from '../../basic/component';
import Tab from '../../basic/tabs/tab';
import TabContainer from '../../basic/tabs/tab_container';
import UsersTable from './users_table';
import GroupsTable from './groups_table';

import { n } from '../../../utils/textutils';

type TargetType = 'user' | 'group';

export default class TargetsWrapper extends Component {
    protected SearchField: HTMLInputElement;
    protected UsersTab: Tab;
    protected UsersTable: UsersTable;
    protected GroupsTable: GroupsTable;
    protected CurrentlyDisplayedTargetType!: TargetType;
    protected SelectedEntitiesCountText: HTMLElement;

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

        this.UsersTab = new Tab('Osoby');
        this.UsersTab.AddOnSelectListener((() => this.SwitchTargetType('user')).bind(this));
        tab_container.AddTab(this.UsersTab);

        let groups_tab = new Tab('Grupy');
        groups_tab.AddOnSelectListener((() => this.SwitchTargetType('group')).bind(this));
        tab_container.AddTab(groups_tab);

        let table_wrapper = document.createElement('div');
        table_wrapper.classList.add('overflow-container-y');
        this.AppendChild(table_wrapper);

        this.UsersTable = new UsersTable();
        this.UsersTable.AddEventListener('selectionchanged', this.OnSelectionChanged.bind(this));
        table_wrapper.appendChild(this.UsersTable.GetElement());
        this.GroupsTable = new GroupsTable();
        this.GroupsTable.AddEventListener('selectionchanged', this.OnSelectionChanged.bind(this));
        table_wrapper.appendChild(this.GroupsTable.GetElement());

        this.SelectedEntitiesCountText = document.createElement('p');
        this.SelectedEntitiesCountText.classList.add('small-margin');
        this.AppendChild(this.SelectedEntitiesCountText);
    }

    async Populate(){
        this.SearchField.value = '';
        this.UsersTab.Select();
        this.SwitchTargetType('user');
        this.PrintNumberOfSelectedEntities(0, 0);

        let users_awaiter = this.UsersTable.Populate();
        let groups_awaiter = this.GroupsTable.Populate();
        await users_awaiter;
        await groups_awaiter;

        this.UsersTable.DeselectAll();
        this.GroupsTable.DeselectAll();

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

    protected OnSelectionChanged(){
        this.PrintNumberOfSelectedEntities(
            this.UsersTable.GetSelectedCount(),
            this.GroupsTable.GetSelectedCount());
    }

    protected PrintNumberOfSelectedEntities(users: number, groups: number){
        if(users > 0 || groups > 0){
            let text = 'Wybrano';

            if(users > 0) text += ' ' + users + ' os' + n(users, 'obę', 'oby', 'ób');
            if(users > 0 && groups > 0) text += ' i';
            if(groups > 0) text += ' ' + groups + ' grup' + n(groups, 'ę', 'y', '');

            text += '.'
            this.SelectedEntitiesCountText.textContent = text;
        }else{
            this.SelectedEntitiesCountText.textContent = '';
        }
    }
}
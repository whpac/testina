import Component from '../../basic/component';
import Tab from '../../basic/tabs/tab';
import TabContainer from '../../basic/tabs/tab_container';
import UsersTable from './users_table';
import GroupsTable from './groups_table';

import { n } from '../../../utils/textutils';
import NavigationPrevention from '../../../1page/navigationprevention';
import User from '../../../entities/user';
import Group from '../../../entities/group';
import { AssignmentTargets } from '../../../entities/assignment';

type TargetType = 'user' | 'group';

export default class TargetsWrapper extends Component<'validationchanged'> {
    protected SearchField: HTMLInputElement;
    protected UsersTab: Tab;
    protected UsersTable: UsersTable;
    protected GroupsTable: GroupsTable;
    protected CurrentlyDisplayedTargetType!: TargetType;
    protected SelectedEntitiesCountText: HTMLElement;
    protected NothingSelectedError: HTMLParagraphElement;

    public IsValid: boolean = true;

    constructor(){
        super();

        this.Element = document.createElement('section');
        this.Element.classList.add('no-margin');

        let targets_description = document.createElement('p');
        targets_description.classList.add('secondary');
        targets_description.textContent = 'Wybierz osoby lub grupy, którym test ma zostać przypisany.';
        this.AppendChild(targets_description);

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

        this.NothingSelectedError = document.createElement('p');
        this.NothingSelectedError.classList.add('error-message', 'specific');
        this.NothingSelectedError.textContent = 'Nie wybrano żadnej osoby ani grupy.';
        this.AppendChild(this.NothingSelectedError);
    }

    async Populate(preselected_targets?: AssignmentTargets){
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
        
        this.UsersTable.SelectUsers(preselected_targets?.Users ?? []);
        this.GroupsTable.SelectGroups(preselected_targets?.Groups ?? []);
        this.Validate();

        this.FilterTable();
    }

    GetSelectedTargets(){
        let targets: (User | Group)[] = [];
        targets = this.UsersTable.GetSelected();
        targets = targets.concat(this.GroupsTable.GetSelected());
        return targets;
    }

    protected Validate(){
        let old_validity = this.IsValid;
        this.IsValid = true;

        let is_anything_selected = this.UsersTable.GetSelectedCount() > 0 || this.GroupsTable.GetSelectedCount() > 0;
        this.NothingSelectedError.style.display = is_anything_selected ? 'none' : '';
        if(!is_anything_selected) this.IsValid = false;

        if(this.IsValid != old_validity) this.FireEvent('validationchanged');
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
        this.Validate();
        NavigationPrevention.Prevent('assign-test-dialog');
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
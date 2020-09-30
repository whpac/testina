import Component from '../../basic/component';
import Tab from '../../basic/tabs/tab';
import TabContainer from '../../basic/tabs/tab_container';
import UsersTable from './users_table';
import GroupsTable from './groups_table';

import { n } from '../../../utils/textutils';
import NavigationPrevention from '../../../1page/navigation_prevention';
import User from '../../../entities/user';
import Group from '../../../entities/group';
import { AssignmentTargets } from '../../../entities/assignment';
import Test from '../../../entities/test';
import ApiEndpoints from '../../../entities/loaders/apiendpoints';

type TargetType = 'user' | 'group';

export default class TargetsWrapper extends Component<'validationchanged'> {
    protected TargetsDescription: HTMLParagraphElement;
    protected SearchField: HTMLInputElement;
    protected UsersTab: Tab;
    protected UsersTable: UsersTable;
    protected GroupsTable: GroupsTable;
    protected CurrentlyDisplayedTargetType!: TargetType;
    protected SelectedEntitiesCountText: HTMLElement;
    protected NothingSelectedError: HTMLParagraphElement;
    protected ShareByLinkWrapper: HTMLElement;
    protected ShareByLinkCheckbox: HTMLInputElement;
    protected LinkPresenterElement: HTMLInputElement;

    protected TestType: number = Test.TYPE_TEST;
    protected WasShareByLinkOriginallySelected: boolean = false;
    public IsValid: boolean = true;

    constructor() {
        super();

        this.Element = document.createElement('section');
        this.Element.classList.add('no-margin');

        this.TargetsDescription = document.createElement('p');
        this.TargetsDescription.classList.add('secondary');
        this.TargetsDescription.textContent = 'Wybierz osoby lub grupy, którym test ma zostać przypisany.';
        this.AppendChild(this.TargetsDescription);

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

        this.ShareByLinkWrapper = document.createElement('div');
        this.AppendChild(this.ShareByLinkWrapper);

        let share_by_link_description = document.createElement('p');
        this.ShareByLinkWrapper.appendChild(share_by_link_description);
        share_by_link_description.classList.add('secondary');
        share_by_link_description.textContent = 'Możesz także udostępnić tę ankietę wszystkim, którym przekażesz link do niej.';

        this.ShareByLinkCheckbox = document.createElement('input');
        this.ShareByLinkCheckbox.type = 'checkbox';
        this.ShareByLinkCheckbox.id = 'share-by-link';
        this.ShareByLinkCheckbox.addEventListener('change', this.ChangeSurveyLinkVisibility.bind(this));
        this.ShareByLinkWrapper.appendChild(this.ShareByLinkCheckbox);

        let share_by_link_label = document.createElement('label');
        this.ShareByLinkWrapper.appendChild(share_by_link_label);
        share_by_link_label.htmlFor = this.ShareByLinkCheckbox.id;
        share_by_link_label.appendChild(document.createTextNode(' Udostępnij wszystkim, którzy dostaną link'));

        this.LinkPresenterElement = document.createElement('input');
        this.ShareByLinkWrapper.appendChild(this.LinkPresenterElement);
        this.LinkPresenterElement.classList.add('link-presenter-input');
        this.LinkPresenterElement.readOnly = true;
        this.LinkPresenterElement.type = 'text';
        this.LinkPresenterElement.value = 'Link zostanie wygenerowany po zapisaniu.';
    }

    async Populate(preselected_targets?: AssignmentTargets) {
        this.SearchField.value = '';
        this.UsersTab.Select();
        this.SwitchTargetType('user');

        if((preselected_targets?.LinkIds ?? []).length > 0) {
            this.ShareByLinkCheckbox.checked = true;
            this.WasShareByLinkOriginallySelected = true;
            this.LinkPresenterElement.value = ApiEndpoints.SurveyFillUrlBeginning + preselected_targets!.LinkIds[0];
        } else {
            this.ShareByLinkCheckbox.checked = false;
            this.WasShareByLinkOriginallySelected = false;
            this.LinkPresenterElement.value = 'Link zostanie wygenerowany po zapisaniu.';
        }

        let users_awaiter = this.UsersTable.Populate();
        let groups_awaiter = this.GroupsTable.Populate();
        await users_awaiter;
        await groups_awaiter;

        this.UsersTable.DeselectAll();
        this.GroupsTable.DeselectAll();

        this.UsersTable.SelectUsers(preselected_targets?.Users ?? []);
        this.GroupsTable.SelectGroups(preselected_targets?.Groups ?? []);

        this.PrintNumberOfSelectedEntities();
        this.Validate();

        this.FilterTable();
        this.ChangeSurveyLinkVisibility();
    }

    GetSelectedTargets() {
        let targets: (User | Group | string)[] = [];
        targets = this.UsersTable.GetSelected();
        targets = targets.concat(this.GroupsTable.GetSelected());

        if(!this.WasShareByLinkOriginallySelected && this.ShareByLinkCheckbox.checked) targets = targets.concat(['link']);

        return targets;
    }

    GetDeselectedTargets() {
        let targets: (User | Group | string)[] = [];
        targets = this.UsersTable.GetDeselected();
        targets = targets.concat(this.GroupsTable.GetDeselected());

        if(this.WasShareByLinkOriginallySelected && !this.ShareByLinkCheckbox.checked) targets = targets.concat(['link']);

        return targets;
    }

    public DisplayAppropriateTargetsDescription(test_type: number) {
        this.TestType = test_type;
        this.Validate();
        switch(test_type) {
            case Test.TYPE_SURVEY:
                this.TargetsDescription.textContent = 'Wybierz osoby lub grupy, którym ankieta ma zostać udostępniona.';
                this.ShareByLinkWrapper.style.display = '';
                break;
            default:
                this.TargetsDescription.textContent = 'Wybierz osoby lub grupy, którym test ma zostać przypisany.';
                this.ShareByLinkWrapper.style.display = 'none';
                break;
        }
    }

    protected Validate() {
        let old_validity = this.IsValid;
        this.IsValid = true;

        switch(this.TestType) {
            case Test.TYPE_SURVEY:
                this.IsValid = true;
                this.NothingSelectedError.style.display = 'none';
                break;
            default:
                let is_anyone_selected = this.UsersTable.GetSelectedCount() > 0 || this.GroupsTable.GetSelectedCount() > 0;
                this.NothingSelectedError.style.display = is_anyone_selected ? 'none' : '';
                if(!is_anyone_selected) this.IsValid = false;
                break;
        }

        if(this.IsValid != old_validity) this.FireEvent('validationchanged');
    }

    protected SwitchTargetType(new_target: TargetType) {
        this.UsersTable.GetElement().style.display = 'none';
        this.GroupsTable.GetElement().style.display = 'none';

        this.CurrentlyDisplayedTargetType = new_target;
        switch(new_target) {
            case 'user':
                this.UsersTable.GetElement().style.display = '';
                break;
            case 'group':
                this.GroupsTable.GetElement().style.display = '';
                break;
        }
        this.FilterTable();
    }

    protected FilterTable() {
        let search_query = this.SearchField.value.toLowerCase();

        switch(this.CurrentlyDisplayedTargetType) {
            case 'user':
                this.UsersTable.Filter(search_query);
                break;
            case 'group':
                this.GroupsTable.Filter(search_query);
                break;
        }
    }

    protected OnSelectionChanged() {
        this.PrintNumberOfSelectedEntities();
        this.Validate();
        NavigationPrevention.Prevent('assign-test-dialog');
    }

    protected PrintNumberOfSelectedEntities() {
        let users = this.UsersTable.GetSelectedCount();
        let groups = this.GroupsTable.GetSelectedCount();

        if(users > 0 || groups > 0) {
            let text = 'Wybrano';

            if(users > 0) text += ' ' + users + ' os' + n(users, 'obę', 'oby', 'ób');
            if(users > 0 && groups > 0) text += ' i';
            if(groups > 0) text += ' ' + groups + ' grup' + n(groups, 'ę', 'y', '');

            text += '.';
            this.SelectedEntitiesCountText.textContent = text;
        } else {
            this.SelectedEntitiesCountText.textContent = '';
        }
    }

    protected ChangeSurveyLinkVisibility() {
        this.LinkPresenterElement.style.display = this.ShareByLinkCheckbox.checked ? '' : 'none';
    }
}
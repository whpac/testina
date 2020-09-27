import Component from '../../basic/component';
import Group from '../../../entities/group';
import GroupLoader from '../../../entities/loaders/grouploader';

export default class GroupsTable extends Component<'selectionchanged'> {
    protected Element: HTMLTableElement;
    protected GroupsTBody: HTMLTableSectionElement;
    protected SearchEmptyTBody: HTMLTableSectionElement;
    protected AreGroupsPopulated: boolean = false;
    protected SelectedCount: number = 0;
    protected Rows: Row[] = [];

    constructor() {
        super();

        this.Element = document.createElement('table');
        this.Element.classList.add('table', 'full-width');

        this.GroupsTBody = this.Element.createTBody();
        this.SearchEmptyTBody = this.Element.createTBody();

        this.SearchEmptyTBody.style.display = 'none';
        let search_empty_tr = this.SearchEmptyTBody.insertRow(-1);
        search_empty_tr.insertCell(-1);
        let text_search_empty_cell = search_empty_tr.insertCell(-1);
        text_search_empty_cell.textContent = 'Nie znaleziono żądanych grup';
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

    async Populate() {
        if(this.AreGroupsPopulated) return;
        this.GroupsTBody.textContent = '';

        let groups = await GroupLoader.GetAll();
        groups.sort((a, b) => (a.Name < b.Name) ? -1 : (a.Name > b.Name) ? 1 : 0);
        for(let group of groups) {
            let tr = this.GroupsTBody.insertRow(-1);

            let checkbox_cell = tr.insertCell(-1);
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.addEventListener('change', (() => this.OnRowSelectionChanged(checkbox.checked, tr)).bind(this));
            checkbox_cell.appendChild(checkbox);

            let group_name = group.Name;
            tr.dataset.groupName = group_name;
            tr.insertCell(-1).textContent = group_name;

            this.Rows.push(new Row(tr, group));
        }
        this.AreGroupsPopulated = true;
    }

    DeselectAll() {
        this.SelectedCount = 0;

        let rows = this.GroupsTBody.rows;
        for(let i = 0; i < rows.length; i++) {
            let first_cell = rows[i].children[0];
            let checkbox = first_cell.children[0] as HTMLInputElement;
            if(checkbox.checked !== undefined) checkbox.checked = false;
        }

        for(let row of this.Rows) {
            row.OriginallySelected = false;
        }
    }

    SelectGroups(groups_to_select: Group[]) {
        let groups = [...groups_to_select];
        for(let row of this.Rows) {
            for(let i = 0; i < groups.length; i++) {
                if(row.Group.Id == groups[i].Id) {
                    let first_cell = row.Tr.children[0];
                    let checkbox = first_cell.children[0] as HTMLInputElement;
                    checkbox.checked = true;
                    groups.splice(i, 1);
                    this.SelectedCount++;
                    row.OriginallySelected = true;
                    break;
                }
            }
        }
    }

    Filter(search_query: string) {
        search_query = search_query.toLowerCase();
        let rows = this.GroupsTBody.rows;
        let found = 0;
        for(let i = 0; i < rows.length; i++) {
            let group_name = rows[i].dataset.groupName ?? '';
            group_name = group_name.toLowerCase();
            if(group_name.includes(search_query)) {
                rows[i].style.display = '';
                found++;
            } else {
                rows[i].style.display = 'none';
            }
        }

        this.SearchEmptyTBody.style.display = (found > 0) ? 'none' : '';
    }

    /**
     * Zwraca grupy zaznaczone przez użytkownika
     * Jeśli dana pozycja była zaznaczona w okienku od początku, nie zostanie zwrócona
     */
    GetSelected() {
        let groups: Group[] = [];
        for(let row of this.Rows) {
            let first_cell = row.Tr.children[0];
            let checkbox = first_cell.children[0] as HTMLInputElement;
            if(checkbox.checked !== undefined && checkbox.checked && !row.OriginallySelected) groups.push(row.Group);
        }
        return groups;
    }

    /**
     * Zwraca grupy odznaczone przez użytkownika
     * Jeśli dana pozycja nie była zaznaczona w okienku od początku, nie zostanie zwrócona
     */
    GetDeselected() {
        let groups: Group[] = [];
        for(let row of this.Rows) {
            let first_cell = row.Tr.children[0];
            let checkbox = first_cell.children[0] as HTMLInputElement;
            if(checkbox.checked !== undefined && !checkbox.checked && row.OriginallySelected) groups.push(row.Group);
        }
        return groups;
    }

    protected OnRowSelectionChanged(is_checked: boolean, row: HTMLTableRowElement) {
        if(is_checked) this.SelectedCount++; else this.SelectedCount--;
        //row.dataset.isSelected = is_checked ? 'true' : 'false';
        this.FireEvent('selectionchanged');
    }

    public GetSelectedCount() {
        return this.SelectedCount;
    }
}

class Row {
    Tr: HTMLTableRowElement;
    OriginallySelected: boolean;
    Group: Group;

    constructor(row: HTMLTableRowElement, group: Group) {
        this.Tr = row;
        this.Group = group;
        this.OriginallySelected = false;
    }
}
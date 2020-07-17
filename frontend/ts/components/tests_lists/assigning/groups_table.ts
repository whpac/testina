import Component from '../../basic/component';
import Group from '../../../entities/group';

export default class GroupsTable extends Component {
    protected Element: HTMLTableElement;
    protected GroupsTBody: HTMLTableSectionElement;
    protected SearchEmptyTBody: HTMLTableSectionElement;
    protected AreGroupsPopulated: boolean = false;

    constructor(){
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

    async Populate(){
        if(this.AreGroupsPopulated) return;
        this.GroupsTBody.textContent = '';

        let groups = await Group.GetAll();
        for(let group of groups){
            let tr = this.GroupsTBody.insertRow(-1);

            let checkbox_cell = tr.insertCell(-1);
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox_cell.appendChild(checkbox);

            let group_name = await group.GetName();
            tr.dataset.groupName = group_name;
            tr.insertCell(-1).textContent = group_name;
        }
    }

    Filter(search_query: string){
        search_query = search_query.toLowerCase();
        let rows = this.GroupsTBody.rows;
        let found = 0;
        for(let i = 0; i < rows.length; i++){
            let group_name = rows[i].dataset.groupName ?? '';
            group_name = group_name.toLowerCase();
            if(group_name.includes(search_query)){
                rows[i].style.display = '';
                found++;
            }else{
                rows[i].style.display = 'none';
            }
        }

        this.SearchEmptyTBody.style.display = (found > 0) ? 'none' : '';
    }
}
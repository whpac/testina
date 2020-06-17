import Component from './component';
import Test from '../entities/test';

export default class QuestionsTable extends Component {
    ContentWrapperElem: HTMLTableSectionElement;

    constructor(){
        super();

        this.Element = document.createElement('table');
        this.Element.classList.add('table', 'full-width');
        this.Element.innerHTML = 
            '<colgroup>' +
                '<col class="shrink" />' +
                '<col />' +
                '<col class="shrink" />' +
                '<col class="shrink" />' +
                '<col class="shrink" />' +
            '</colgroup>' +
            '<tr>' +
                '<th></th>' +
                '<th>Treść</th>' +
                '<th>Punkty</th>' +
                '<th></th>' +
                '<th></th>' +
            '</tr>';

        this.ContentWrapperElem = document.createElement('tbody');
        this.ContentWrapperElem.classList.add('content-tbody');
        this.ContentWrapperElem.innerHTML = '<tr><td>Loading...</td></tr>';
        this.Element.appendChild(this.ContentWrapperElem);

        let nocontent_tbody = document.createElement('tbody');
        nocontent_tbody.classList.add('nocontent-tbody');
        nocontent_tbody.innerHTML = 
            '<tr>' +
                '<td></td>' +
                '<td><i class="secondary">Nie ma jeszcze żadnych pytań</i></td>' +
                '<td></td>' +
                '<td></td>' +
                '<td></td>' +
            '</tr>'
        this.Element.appendChild(nocontent_tbody);
    }

    async LoadQuestions(test: Test){
        this.ContentWrapperElem.innerText = '';
        let tr = this.ContentWrapperElem.insertRow(-1);
        let td = tr.insertCell(-1);
        td.appendChild(document.createTextNode('Test'));
    }
}
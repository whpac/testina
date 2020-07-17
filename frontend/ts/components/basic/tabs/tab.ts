import Component from '../component';

export default class Tab extends Component {
    protected RadioButton: HTMLInputElement;
    protected ContentElement: HTMLElement;

    constructor(caption?: string){
        super();

        this.Element = document.createElement('label');
        this.Element.classList.add('tab');

        this.RadioButton = document.createElement('input');
        this.RadioButton.type = 'radio';
        this.Element.appendChild(this.RadioButton);

        this.ContentElement = document.createElement('span');
        this.ContentElement.classList.add('tab-content');
        this.Element.appendChild(this.ContentElement);

        if(caption !== undefined){
            this.AppendChild(document.createTextNode(caption));
        }
    }

    AppendChild(child: Node){
        this.ContentElement.appendChild(child);
    }

    SetGroupName(name: string){
        this.RadioButton.name = name;
    }

    Select(){
        this.RadioButton.checked = true;
    }
}
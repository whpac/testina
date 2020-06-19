import Component from './component';

export default class Card extends Component {
    ButtonsWrapper: HTMLElement;
    ContentWrapper: HTMLElement;

    constructor(...classes: string[]){
        super();

        this.Element = document.createElement('div');
        this.Element.classList.add('card', ...classes);

        this.ButtonsWrapper = document.createElement('div');
        this.ButtonsWrapper.classList.add('card-buttons');
        this.ContentWrapper = document.createElement('div');
        this.ContentWrapper.classList.add('card-content');

        this.Element.appendChild(this.ContentWrapper);
        this.Element.appendChild(this.ButtonsWrapper);
    }

    AddButton(button: HTMLButtonElement){
        this.ButtonsWrapper.appendChild(button);
    }

    GetContentElement(){
        return this.ContentWrapper;
    }

    AppendChild(child: HTMLElement){
        this.ContentWrapper.appendChild(child);
    }
}
import Component from './component';

export default class Card extends Component {

    constructor(...classes: string[]){
        super();

        this.Element = document.createElement('div');
        this.Element.classList.add('card', ...classes);
    }
}
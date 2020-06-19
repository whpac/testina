import Component from './component'

export default class HelpLink extends Component {

    constructor(target?: string){
        super();

        this.Element = document.createElement('a');
        this.Element.classList.add('get-help', 'fa', 'fa-question-circle');
        this.Element.title = 'Pomoc';
        (<HTMLAnchorElement>this.Element).href = 'pomoc#' + (target ?? '');
        (<HTMLAnchorElement>this.Element).target = '_blank';

        if(target === undefined) this.Element.classList.add('todo');
    }
}
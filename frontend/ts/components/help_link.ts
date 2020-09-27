import Component from './basic/component';

export default class HelpLink extends Component {
    protected Element: HTMLAnchorElement;

    constructor(target?: string) {
        super();

        this.Element = document.createElement('a');
        this.Element.classList.add('get-help', 'fa', 'fa-question-circle');
        this.Element.title = 'Pomoc';
        this.Element.href = 'pomoc#' + (target ?? '');
        this.Element.target = '_blank';

        if(target === undefined) this.Element.classList.add('todo');
    }
}
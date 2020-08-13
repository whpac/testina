import Component from './component';

/**
 * Komponent z ikoną
 */
export default class Icon extends Component{

    /**
     * Komponent z ikoną
     * @param icon Nazwa ikony
     * @param classes Klasy CSS elementu HTML
     */
    constructor(icon: string, classes?: string[]){
        super();

        this.Element = document.createElement('span');
        this.Element.classList.add('fa');
        this.Element.classList.add(this.GetIconByKey(icon));
        if(classes !== undefined) this.Element.classList.add(...classes);
    }

    protected GetIconByKey(icon_name: string){
        return 'fa-' + icon_name;
    }
}
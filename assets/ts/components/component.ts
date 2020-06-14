export default class Component {
    protected Element: HTMLElement;

    constructor(){
        this.Element = document.createElement('div');
    }

    GetElement(){
        return this.Element;
    }

    AppendChild(child: HTMLElement){
        this.Element.appendChild(child);
    }
}
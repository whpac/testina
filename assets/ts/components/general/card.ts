import Component, { ComponentState } from './component';

/**
 * Panel interfejsu użytkownika, z miejscem na przyciski
 */
export default class Card extends Component {
    /** Element, w którym znajdzie się zawrtość karty */
    ContentWrapper: HTMLElement;

    /** Element, w którym znajdą się przyciski */
    ButtonsWrapper: HTMLElement;

    constructor(...classes: string[]){
        super();

        this.Element = document.createElement('div');
        this.Element.classList.add('card', ...classes);

        this.ContentWrapper = document.createElement('div');
        this.ContentWrapper.classList.add('card-content');
        this.Element.appendChild(this.ContentWrapper);

        this.ButtonsWrapper = document.createElement('div');
        this.ButtonsWrapper.classList.add('card-buttons');
        this.Element.appendChild(this.ButtonsWrapper);
        
        this.SetState(ComponentState.LOADED);
    }

    /**
     * Zwraca element z zawartością karty
     * @deprecated
     */
    GetContentElement(){
        return this.ContentWrapper;
    }

    /**
     * Dodaje element do zawarości
     * @param child Element HTML
     */
    AppendChild(child: HTMLElement){
        this.ContentWrapper.appendChild(child);
    }

    /**
     * Dodaje przycisk do panelu
     * @param button Przycisk
     */
    AddButton(button: HTMLButtonElement){
        this.ButtonsWrapper.appendChild(button);
    }
}
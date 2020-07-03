import * as Dialogs from '../../dialogs';
import HelpLink from '../help_link';

/**
 * Klasa bazowa dla okienek dialogowych
 * TODO: dziedziczyć z Component #24
 */
export default class Dialog{
    /** Element reprezentujący okno dialogowe */
    protected DialogElement: HTMLElement;

    /** Nagłówek okna dialogowego */
    protected HeaderElement: HTMLHeadingElement;

    /** Zawartość nagłówka */
    protected HeaderContentElement: HTMLSpanElement;

    /** Zawartość okna dialogowego */
    protected Content: Node[] = [];

    /** Przyciski okna dialogowego */
    protected Buttons: HTMLButtonElement[] = [];

    /** Czy okno zostało już wyrenderowane? */
    protected IsRendered: boolean = false;

    constructor(){
        this.DialogElement = document.createElement('div');
        this.DialogElement.setAttribute('role', 'alertdialog');
        this.DialogElement.classList.add('dialog');

        this.HeaderElement = document.createElement('h2');
        this.DialogElement.appendChild(this.HeaderElement);

        this.HeaderContentElement = document.createElement('span');
        this.HeaderElement.appendChild(this.HeaderContentElement);
    }

    /**
     * Wstawia zadany tekst do nagłówka okna dialogowego
     * @param text Tekst
     */
    SetHeader(text: string){
        this.HeaderContentElement.innerText = text;
    }

    /**
     * Dodaje przycisk do okna dialogowego
     * @param btn Przycisk
     */
    AddButton(btn: HTMLButtonElement){
        this.Buttons.push(btn);
    }

    /**
     * Dodaje element do zawartości okna dialogowego
     * @param elem Element
     */
    AddContent(elem: Node){
        this.Content.push(elem);
    }

    /**
     * Dodaje klasy CSS do głównego elementu okna
     * @param classes Tablica klas CSS
     */
    AddClasses(classes: string[]){
        this.DialogElement.classList.add(...classes);
    }

    /**
     * Wyświetla przycisk prowadzący do strony pomocy
     * @param target Docelowy fragment pomocy
     */
    DisplayHelpButton(target?: string){
        this.HeaderElement.appendChild(new HelpLink(target).GetElement());
    }

    /**
     * Przygotowuje okno do wyświetlenia
     */
    Render(){
        var content_wrapper = document.createElement('div');
        content_wrapper.classList.add('content');
        
        this.Content.forEach((elem) => {
            content_wrapper.appendChild(elem);
        });
        this.DialogElement.appendChild(content_wrapper);

        var button_wrapper = document.createElement('div');
        button_wrapper.classList.add('buttons');

        this.Buttons.forEach((button) => {
            button_wrapper.appendChild(button);
        });
        this.DialogElement.appendChild(button_wrapper);
        this.IsRendered = true;
    }

    /**
     * Wyświetla okno dialogowe
     */
    Show(){
        if(!this.IsRendered) this.Render();
        Dialogs.ShowDialog(this.DialogElement);
    }

    /**
     * Ukrywa okno dialogowe
     */
    Hide(){
        Dialogs.HideDialog(this.DialogElement);
    }
}
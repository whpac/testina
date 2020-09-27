import HelpLink from '../help_link';

/**
 * Klasa bazowa dla okienek dialogowych
 */
export default class Dialog {
    /** Element reprezentujący okno dialogowe */
    protected DialogElement: HTMLElement;

    /** Nagłówek okna dialogowego */
    protected HeaderElement: HTMLHeadingElement;

    /** Zawartość nagłówka */
    protected HeaderContentElement: HTMLSpanElement;

    /** Zawartość okna dialogowego */
    protected ContentWrapper: HTMLElement;

    /** Element, w którym znajdą się przyciski okienka */
    protected ButtonsWrapper: HTMLElement;

    constructor() {
        this.DialogElement = document.createElement('div');
        this.DialogElement.setAttribute('role', 'alertdialog');
        this.DialogElement.classList.add('dialog');

        this.HeaderElement = document.createElement('h2');
        this.DialogElement.appendChild(this.HeaderElement);

        this.HeaderContentElement = document.createElement('span');
        this.HeaderElement.appendChild(this.HeaderContentElement);

        this.ContentWrapper = document.createElement('div');
        this.ContentWrapper.classList.add('content');
        this.DialogElement.appendChild(this.ContentWrapper);

        this.ButtonsWrapper = document.createElement('div');
        this.ButtonsWrapper.classList.add('buttons');
        this.DialogElement.appendChild(this.ButtonsWrapper);
    }

    /**
     * Wstawia zadany tekst do nagłówka okna dialogowego
     * @param text Tekst
     */
    SetHeader(text: string) {
        this.HeaderContentElement.innerText = text;
    }

    /**
     * Dodaje przycisk do okna dialogowego
     * @param btn Przycisk
     */
    AddButton(btn: HTMLButtonElement) {
        this.ButtonsWrapper.appendChild(btn);
    }

    /**
     * Dodaje element do zawartości okna dialogowego
     * @param elem Element
     */
    AddContent(elem: Node) {
        this.ContentWrapper.appendChild(elem);
    }

    /**
     * Dodaje klasy CSS do głównego elementu okna
     * @param classes Tablica klas CSS
     */
    AddClasses(classes: string[]) {
        this.DialogElement.classList.add(...classes);
    }

    /**
     * Wyświetla przycisk prowadzący do strony pomocy
     * @param target Docelowy fragment pomocy
     */
    DisplayHelpButton(target?: string) {
        this.HeaderElement.appendChild(new HelpLink(target).GetElement());
    }

    /**
     * Wyświetla okno dialogowe
     */
    Show() {
        this.DialogElement.classList.add('shown');

        DialogBackdrop.AppendElement(this.DialogElement);
    }

    /**
     * Ukrywa okno dialogowe
     */
    Hide() {
        DialogBackdrop.RemoveElement(this.DialogElement);

        this.DialogElement.classList.remove('shown');
    }
}

class DialogBackdrop {
    /** Element wykorzystywany jako tło pod oknami dialogowymi */
    protected static BackdropElement: HTMLElement;
    /** Stos wyświetlanych okien dialogowych */
    protected static DialogElements: HTMLElement[];

    /** Wyświetla tło */
    protected static Display() {
        if(this.BackdropElement === undefined) {
            this.BackdropElement = document.createElement('div');
            this.BackdropElement.classList.add('dialog-backdrop');
            document.body.appendChild(this.BackdropElement);
        }
        this.BackdropElement.classList.add('shown');
    }

    /** Ukrywa tło */
    protected static Hide() {
        this.BackdropElement.classList.remove('shown');
    }

    /**
     * Dodaje wskazany element na środek tła
     * @param element Element HTML do pokazania
     */
    static AppendElement(element: HTMLElement) {
        if(this.DialogElements === undefined) this.DialogElements = [];

        if(this.DialogElements.length == 0) {
            this.Display();
        } else {
            let current_dialog = this.DialogElements[this.DialogElements.length - 1];
            this.BackdropElement.removeChild(current_dialog);
        }

        this.DialogElements.push(element);
        this.BackdropElement.appendChild(element);
    }

    /**
     * Usuwa dany element z tła
     * @param element Element HTML do usunięcia z tła
     */
    static RemoveElement(element: HTMLElement) {
        this.DialogElements.pop();
        this.BackdropElement.removeChild(element);

        if(this.DialogElements.length == 0) {
            this.Hide();
        } else {
            let current_dialog = this.DialogElements[this.DialogElements.length - 1];
            this.BackdropElement.appendChild(current_dialog);
        }
    }
}
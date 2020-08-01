import Component from '../component';

type OnSelectListener = (tab: Tab) => void;

/** Klasa reprezentująca pojedynczą kartę */
export default class Tab extends Component {
    /** Przycisk radio, który stanowi podstawę funkcjonowania kart */
    protected RadioButton: HTMLInputElement;
    /** Element przechowujący zawartość karty */
    protected ContentElement: HTMLElement;
    /** Zbiór procedur obsługi zdarzenia aktywowania karty */
    protected OnSelectListeners: Set<OnSelectListener>;

    /**
     * Klasa reprezentująca pojedynczą kartę
     * @param caption Opcjonalna treść karty
     */
    constructor(caption?: string){
        super();

        this.OnSelectListeners = new Set();

        this.Element = document.createElement('label');
        this.Element.classList.add('tab');

        this.RadioButton = document.createElement('input');
        this.RadioButton.type = 'radio';
        this.RadioButton.addEventListener('change', this.OnChange.bind(this));
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

    /**
     * Ustawia nazwę grupy. W każdej grupie zaznaczona może być tylko jedna karta
     * @param name Nazwa grupy
     */
    SetGroupName(name: string){
        this.RadioButton.name = name;
    }

    /** Aktywuje kartę */
    Select(){
        this.RadioButton.checked = true;
    }

    /**
     * Dodaje procedurę obsługi zdarzenia aktywowania karty
     * @param listener Procedura obsługi
     */
    AddOnSelectListener(listener: OnSelectListener){
        this.OnSelectListeners.add(listener);
    }

    /** Obsługuje zdarzenie change w przycisku radio */
    protected OnChange(){
        if(!this.RadioButton.checked) return;

        for(let listener of this.OnSelectListeners){
            listener(this);
        }
    }
}
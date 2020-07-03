type StateChangeEventListener = (component: Component) => void;

/**
 * Klasa bazowa dla wszystkich komponentów UI
 */
export default class Component {
    /** Element HTML reprezentujący komponent */
    protected Element: HTMLElement;

    /** Aktualny stan komponentu */
    private State: ComponentState;

    /** Procedury obsługi zdarzenia zmiany stanu */
    private StateChangeListeners: Set<StateChangeEventListener>;

    /**
     * Tworzy komponent i ustawia jego stan na NOT_LOADED
     */
    constructor(){
        this.Element = document.createElement('div');
        this.State = ComponentState.NOT_LOADED;
        this.StateChangeListeners = new Set();
    }

    /**
     * Zwraca element HTML reprezentujący komponent
     */
    GetElement(){
        return this.Element;
    }

    /**
     * Dodaje element potomny do komponentu
     * @param child Element HTML do dodania
     */
    AppendChild(child: HTMLElement){
        this.Element.appendChild(child);
    }

    /**
     * Zmienia stan komponentu
     * @param new_state Nowy stan
     */
    protected SetState(new_state: ComponentState){
        this.State = new_state;
        this.FireStateChangeEvent();
    }

    /**
     * Zwraca aktualny stan komponentu
     */
    GetState(){
        return this.State;
    }

    /**
     * Wywołuje procedury obsługi zdarzenia zmiany stanu
     */
    private FireStateChangeEvent(){
        for(let listener of this.StateChangeListeners){
            listener(this);
        }
    }

    /**
     * Dodaje procedurę obsługi zdarzenia zmiany stanu komponentu
     * @param listener Procedura obsługi zdarzenia zmiany stanu
     */
    AddOnStateChanged(listener: StateChangeEventListener){
        this.StateChangeListeners.add(listener);
    }
}

/**
 * Reprezentuje możliwe stany komponentu
 */
enum ComponentState{
    NOT_LOADED,
    LOADING,
    LOADED,
    ERROR
}
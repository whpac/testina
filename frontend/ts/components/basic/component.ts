/** Typ reprezentujący nazwy zdarzeń obsługiwane przez komponent */
type ComponentEvents = 'statechanged';

/** Typ funkcji obsługi zdarzeń */
type EventListener = (component: Component<string>) => void;

/** Zbiór procedur obsługi zdarzeń */
type EventListenerCollection = {
    [event_name: string]: Set<EventListener>
}

/**
 * Klasa bazowa dla wszystkich komponentów UI
 * @param EventName Nazwy zdarzeń obsługiwanych przez komponent ponad standardowe
 */
export default class Component<EventName extends string = ''> {
    /** Element HTML reprezentujący komponent */
    protected Element: HTMLElement;

    /** Zbiór procedur obsługi zdarzeń */
    private EventListeners: EventListenerCollection = {};

    /** Aktualny stan komponentu */
    private State: ComponentState;

    /**
     * Tworzy komponent i ustawia jego stan na NOT_LOADED
     */
    constructor(){
        this.Element = document.createElement('div');
        this.State = ComponentState.NOT_LOADED;
    }

    /**
     * Zwraca element HTML reprezentujący komponent
     * @deprecated
     */
    GetElement(){
        return this.Element;
    }

    /**
     * Dodaje element potomny do komponentu
     * @param child Element HTML lub komponent do dodania
     */
    AppendChild(child: Node | Component<string>){
        if(child instanceof Node){
            this.Element.appendChild(child);
        }else if(child instanceof Component){
            this.Element.appendChild(child.Render());
        }
    }

    /**
     * Zwraca reprezentację komponentu jako element HTML
     */
    Render(){
        return this.Element;
    }

    /**
     * Zmienia stan komponentu
     * @param new_state Nowy stan
     */
    protected SetState(new_state: ComponentState){
        this.State = new_state;
        this.FireEvent('statechanged');
    }

    /**
     * Zwraca aktualny stan komponentu
     */
    GetState(){
        return this.State;
    }

    /**
     * Dodaje procedurę obsługi zdarzenia
     * @param event Zdarzenie do obsłużenia
     * @param listener Procedura obsługi
     */
    public AddEventListener(event: EventName | ComponentEvents, listener: EventListener){
        if(this.EventListeners[event] === undefined){
            this.EventListeners[event] = new Set<EventListener>();
        }

        this.EventListeners[event].add(listener);
    }

    /**
     * Usuwa procedurę obsługi zdarzenia
     * @param event Obsługiwane zdarzenie
     * @param listener Procedura do usunięcia
     */
    public RemoveEventListener(event: EventName, listener: EventListener){
        this.EventListeners[event]?.delete(listener);
    }

    /**
     * Wywołuje zdarzenie
     * @param event Zdarzenie do wywołania
     */
    protected FireEvent(event: EventName | ComponentEvents){
        this.EventListeners[event]?.forEach((listener) => listener(this));
    }
}

/**
 * Reprezentuje możliwe stany komponentu
 */
export enum ComponentState{
    NOT_LOADED,
    LOADING,
    LOADED,
    ERROR
}
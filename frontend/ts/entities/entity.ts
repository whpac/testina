/** Typ reprezentujący obsługiwane nazwy zdarzeń */
type EventName = 'change' | 'remove';

/** Typ funkcji obsługi zdarzeń */
type EventListener = (entity: Entity) => void;

/** Zbiór procedur obsługi zdarzeń */
type EventListenerCollection = {
    [event_name: string]: Set<EventListener>
}

/** Ogólny typ obiektu indeksowanego liczbami */
export type Collection<T> = {
    [id: number]: T
}

/** Klasa bazowa dla wszystkich obiektów pochodzących z API */
export default class Entity {
    private EventListeners: EventListenerCollection = {};

    /**
     * Dodaje procedurę obsługi zdarzenia
     * @param event Zdarzenie do obsłużenia
     * @param listener Procedura obsługi
     */
    public AddEventListener(event: EventName, listener: EventListener){
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
    protected FireEvent(event: EventName){
        this.EventListeners[event]?.forEach((listener) => listener(this));
    }
}
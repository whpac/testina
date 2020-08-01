/** Typ reprezentujący obsługiwane nazwy zdarzeń */
type EventName = 'change' | 'remove';

/** Typ funkcji obsługi zdarzeń */
type EventListener = (entity: Entity) => void;

/** Zbiór procedur obsługi zdarzeń */
type EventListenerCollection = {
    [event_name: string]: Set<EventListener>
}

/** Ogólny typ obiektu indeksowanego liczbami */
export class Collection<T> {
    [id: number]: T

    /**
     * Sprawdza, czy podana kolekcja jest pusta. Kolekcja jest uważana za pustą, jeżeli nie zawiera elementów lub pierwszy element jest pustym obiektem.
     * @param collection Kolekcja do sprawdzenia
     */
    public static IsEmpty<T>(collection: Collection<T> | undefined){
        if(collection === undefined) return true;
        
        let keys = Object.keys(collection);
        if(keys.length == 0) return true;
        if(Object.keys(collection[Number(keys[0])])) return true;
        return false;
    }
}

/** Klasa bazowa dla wszystkich encji */
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
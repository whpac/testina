import Entity, { EntityEventListener, EntityEventName } from '../schemas/entity';

/** Zbiór procedur obsługi zdarzeń */
type EventListenerCollection = {
    [event_name: string]: Set<EntityEventListener>;
};

/** Klasa bazowa dla wszystkich encji, dostarcza obsługę zdarzeń */
export default class ConcreteEntity implements Entity {
    private EventListeners: EventListenerCollection = {};
    private SilencedEvents: Set<EntityEventName> = new Set<EntityEventName>();

    /**
     * Dodaje procedurę obsługi zdarzenia
     * @param event Zdarzenie do obsłużenia
     * @param listener Procedura obsługi
     */
    public AddEventListener(event: EntityEventName, listener: EntityEventListener) {
        if(this.EventListeners[event] === undefined) {
            this.EventListeners[event] = new Set<EntityEventListener>();
        }

        this.EventListeners[event].add(listener);
    }

    /**
     * Usuwa procedurę obsługi zdarzenia
     * @param event Obsługiwane zdarzenie
     * @param listener Procedura do usunięcia
     */
    public RemoveEventListener(event: EntityEventName, listener: EntityEventListener) {
        this.EventListeners[event]?.delete(listener);
    }

    /**
     * Wywołuje zdarzenie
     * @param event Zdarzenie do wywołania
     */
    protected FireEvent(event: EntityEventName, event_data?: any) {
        if(this.SilencedEvents.has(event)) return;

        this.EventListeners[event]?.forEach((listener) => listener(this, event_data));
    }

    /**
     * Wycisza zdarzenie
     * @param event Zdarzenie do wyciszenia
     */
    protected SilenceEvent(event: EntityEventName) {
        this.SilencedEvents.add(event);
    }

    /**
     * Usuwa wyciszenie zdarzenia
     * @param event Zdarzenie, które ma przestać być wyciszone
     */
    protected UnsilenceEvent(event: EntityEventName) {
        this.SilencedEvents.delete(event);
    }
}
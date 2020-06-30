type EventName = 'change' | 'remove';

type EventListener = (entity: Entity) => void;

type EventListenerCollection = {
    [event_name: string]: Set<EventListener>
}

export type Collection<T> = {
    [id: number]: T
}

export default class Entity {
    private EventListeners: EventListenerCollection = {};

    public AddEventListener(event: EventName, listener: EventListener){
        if(this.EventListeners[event] === undefined){
            this.EventListeners[event] = new Set<EventListener>();
        }

        this.EventListeners[event].add(listener);
    }

    public RemoveEventListener(event: EventName, listener: EventListener){
        this.EventListeners[event]?.delete(listener);
    }

    protected FireEvent(event: EventName){
        this.EventListeners[event]?.forEach((listener) => listener(this));
    }
}
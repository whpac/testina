/** Typ reprezentujący obsługiwane nazwy zdarzeń */
export type EntityEventName = 'changed' | 'removed';

/** Typ funkcji obsługi zdarzeń */
export type EntityEventListener = (entity: Entity, event_data?: any) => void;

/** Klasa bazowa dla wszystkich encji */
export default interface Entity {
    /**
     * Dodaje procedurę obsługi zdarzenia
     * @param event Zdarzenie do obsłużenia
     * @param listener Procedura obsługi
     */
    AddEventListener(event: EntityEventName, listener: EntityEventListener): void;

    /**
     * Usuwa procedurę obsługi zdarzenia
     * @param event Obsługiwane zdarzenie
     * @param listener Procedura do usunięcia
     */
    RemoveEventListener(event: EntityEventName, listener: EntityEventListener): void;
}
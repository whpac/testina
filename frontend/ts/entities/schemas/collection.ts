export default interface Collection<TKey, TValue> extends Iterable<[TKey, TValue]> {

    /**
     * Tworzy nowy element w kolekcji
     */
    Create(): TValue | Promise<TValue> | PromiseLike<TValue>;

    /**
     * Zwraca element o podanym identyfikatorze
     * @param key Identyfikator elementu
     */
    Get(key: TKey): TValue;

    /**
     * Zwraca iterator po kolekcji
     */
    [Symbol.iterator](): Iterator<[TKey, TValue]>;
}
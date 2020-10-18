export default interface Collection<TValue> {

    Create(): TValue | Promise<TValue> | PromiseLike<TValue>;
    [Symbol.iterator](): IterableIterator<TValue>;
}
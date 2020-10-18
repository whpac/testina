export default interface TransactionalSaver {

    BeginSaveTransaction(): void;
    CommitSaveTransaction(): void | Promise<void> | PromiseLike<void>;
    RollbackSaveTransaction(): void;
}
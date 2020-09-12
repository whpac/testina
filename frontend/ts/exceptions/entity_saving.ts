import BaseException from './base';

/**
 * Wyjątek, zgłaszany, kiedy wystąpi błąd w czasie zapisywania encji
 */
export default class EntitySavingException extends BaseException {
    public readonly Reason: BaseException;

    /**
     * Tworzy wyjątek, oznaczający błąd zapisywania encji
     * @param message Treść błędu
     * @param reason Powód zgłoszenia błędu
     */
    public constructor(message: string, reason: BaseException) {
        super(message);
        this.Reason = reason;
    }
}
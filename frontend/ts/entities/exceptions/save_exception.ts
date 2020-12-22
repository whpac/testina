import BaseException from '../../exceptions/base';
/**
 * Wyjątek, zgłaszany, kiedy wystąpi błąd w czasie zapisywania encji
 */
export default class SaveException extends BaseException {
    public readonly Reason: BaseException | undefined;

    /**
     * Tworzy wyjątek, oznaczający błąd zapisywania encji
     * @param message Treść błędu
     * @param reason Powód zgłoszenia błędu
     */
    public constructor(message: string, reason?: BaseException | undefined) {
        super(message);
        this.Reason = reason;
    }
}
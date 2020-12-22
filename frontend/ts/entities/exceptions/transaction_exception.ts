import BaseException from '../../exceptions/base';

/**
 * Wyjątek zgłaszany, kiedy wystąpi błąd powiązany z systemem transakcji
 */
export default class TransactionException extends BaseException {

    /**
     * Tworzy wyjątek, oznaczający błąd transakcji
     * @param message Treść błędu
     */
    public constructor(message: string) {
        super(message);
    }
}
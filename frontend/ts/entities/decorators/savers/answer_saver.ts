import BaseException from '../../../exceptions/base';
import XHR from '../../../network/xhr';
import SaveException from '../../exceptions/save_exception';
import TransactionException from '../../exceptions/transaction_exception';
import ApiEndpoints from '../../loaders/apiendpoints';
import Answer from '../../schemas/answer';
import AnswerDecorator from '../abstract/answer_decorator';
import TransactionalSaver from './transactional_saver';

export default class AnswerSaver extends AnswerDecorator implements TransactionalSaver {
    protected IsTransactionBegun: boolean;
    protected TransactionData: Map<string, any>;

    public constructor(answer: Answer) {
        super(answer);

        this.IsTransactionBegun = false;
        this.TransactionData = new Map<string, any>();
    }

    SetText(new_text: string): void {
        let auto_commit = !this.IsTransactionBegun;
        if(auto_commit) this.BeginSaveTransaction();

        this.TransactionData.set('text', new_text);

        if(auto_commit) this.CommitSaveTransaction();
    }

    SetIsCorrect(new_correct: boolean): void {
        let auto_commit = !this.IsTransactionBegun;
        if(auto_commit) this.BeginSaveTransaction();

        this.TransactionData.set('correct', new_correct);

        if(auto_commit) this.CommitSaveTransaction();
    }

    SetOrder(new_order: number): void {
        let auto_commit = !this.IsTransactionBegun;
        if(auto_commit) this.BeginSaveTransaction();

        this.TransactionData.set('order', new_order);

        if(auto_commit) this.CommitSaveTransaction();
    }

    /**
     * Rozpoczyna transakcję zapisu odpowiedzi.
     * 
     * Jeżeli transakcja jest już w toku, zwraca wyjątek TransactionException.
     */
    BeginSaveTransaction(): void {
        if(this.IsTransactionBegun) throw new TransactionException('Transakcja jest w toku. Nie można rozpocząć kolejnej.');

        this.IsTransactionBegun = true;
        this.TransactionData.clear();
    }

    /**
     * Zatwierdza transakcję zapisu odpowiedzi.
     * 
     * Jeżeli nie rozpoczęto transakcji, zwraca wyjątek TransactionException.
     * 
     * W razie wystąpienia błędu podczas zapisu odpowiedzi, zwraca wyjątek SaveException.
     */
    async CommitSaveTransaction(): Promise<void> {
        if(!this.IsTransactionBegun) throw new TransactionException('Nie rozpoczęto transakcji. Nie można jej zatwierdzić.');

        let request_payload: any = {};
        for(let [key, value] of this.TransactionData) {
            request_payload[key] = value;
        }

        try {
            let result = await XHR.PerformRequest(ApiEndpoints.GetEntityUrl(this), 'PUT', request_payload);
            let is_successful = result.Status == 204;

            if(is_successful) {
                this.PopulateThisWithTransactionData();
            } else {
                this.RollbackSaveTransaction();
                throw new SaveException('Nie udało się zapisać odpowiedzi.');
            }
        } catch(e) {
            this.RollbackSaveTransaction();

            let inner_exception = e;
            if(!(inner_exception instanceof BaseException)) inner_exception = undefined;

            throw new SaveException('Wystąpił błąd podczas zapisywania odpowiedzi.', inner_exception);
        }
    }

    /**
     * Wycofuje transakcję zapisu odpowiedzi
     */
    RollbackSaveTransaction(): void {
        this.IsTransactionBegun = false;
        this.TransactionData.clear();
    }

    /**
     * Wypełnia odpowiedź danymi transakcji
     */
    protected PopulateThisWithTransactionData(): void {
        let functions: { [key: string]: ((param: any) => void); } = {
            text: this.Answer.SetText,
            order: this.Answer.SetOrder,
            correct: this.Answer.SetIsCorrect
        };

        this.SilenceEvent('changed');
        for(let [key, value] of this.TransactionData) {
            functions[key]?.(value);
        }

        this.UnsilenceEvent('changed');
        this.FireEvent('changed');
    }
}
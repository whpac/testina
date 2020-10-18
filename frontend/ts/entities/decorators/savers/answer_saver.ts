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

    BeginSaveTransaction(): void {
        if(this.IsTransactionBegun) throw new Error('Transakcja jest w toku. Nie można rozpocząć kolejnej.');

        this.IsTransactionBegun = true;
        this.TransactionData.clear();
    }

    async CommitSaveTransaction(): Promise<void> {
        if(!this.IsTransactionBegun) throw new Error('Nie rozpoczęto transakcji. Nie można jej zatwierdzić.');

        let request_payload: any = {};
        for(let [key, value] of this.TransactionData) {
            request_payload[key] = value;
        }

        // TODO: Wyślij dane na serwer

        let result = true;
        if(result) this.PopulateThisWithTransactionData();
        else this.RollbackSaveTransaction();
    }

    RollbackSaveTransaction(): void {
        this.IsTransactionBegun = false;
        this.TransactionData.clear();
    }

    PopulateThisWithTransactionData(): void {
        let functions: { [key: string]: undefined | ((param: any) => void); } = {
            text: this.Answer.SetText,
            order: this.Answer.SetOrder,
            correct: this.Answer.SetIsCorrect
        };

        for(let [key, value] of this.TransactionData) {
            functions[key]?.(value);
        }
    }
}
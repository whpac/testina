import Answer from '../schemas/answer';
import Collection from '../schemas/collection';
import ConcreteEntity from './concrete_entity';

export default class ConcreteAnswerCollection extends ConcreteEntity implements Collection<number, Answer> {
    protected Answers: Map<number, Answer>;

    public constructor(answers: Iterable<[number, Answer]> = []) {
        super();

        this.Answers = new Map<number, Answer>(answers);
    }

    Create(): Answer | Promise<Answer> | PromiseLike<Answer> {
        throw new Error('Method not implemented.');
    }

    Get(key: number): Answer {
        let value = this.Answers.get(key);

        if(value === undefined) throw new RangeError('Indeks ' + key + ' nie istnieje w tej kolekcji.');

        return value;
    }

    [Symbol.iterator](): Iterator<[number, Answer]> {
        return this.Answers[Symbol.iterator]();
    }
}
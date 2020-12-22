import Answer from '../answer';
import Collection from '../collection';

export default interface AnswerLoader {

    LoadAll(): Promise<Collection<number, Answer>>;
    LoadById(answer_id: number): Promise<Answer>;
}
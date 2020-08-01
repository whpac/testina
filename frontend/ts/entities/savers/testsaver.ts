import * as XHR from '../../utils/xhr';
import Test from '../test';

export default class TestSaver {

    /**
     * Aktualizuje test
     * @param test Test do zapisania
     */
    public static async Update(test: Test){
        let request_data = {
            name: test.Name,
            question_multiplier: test.QuestionMultiplier,
            time_limit: test.TimeLimit
        };
        let result = await XHR.Request('api/tests/' + test.Id.toString(), 'PUT', request_data);
        if(result.Status != 204){
            throw result;
        }
    }
}
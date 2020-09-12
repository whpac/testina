import * as XHR from '../../utils/xhr';
import ApiEndpoints from '../loaders/apiendpoints';
import Test from '../test';

export default class TestSaver {

    /**
     * Aktualizuje test
     * @param test Test do zapisania
     */
    public static async Update(test: Test) {
        let request_data = {
            name: test.Name,
            question_multiplier: test.QuestionMultiplier,
            time_limit: test.TimeLimit,
            description: test.Description
        };
        let result = await XHR.PerformRequest(ApiEndpoints.GetEntityUrl(test), 'PUT', request_data);
        if(result.Status != 204) {
            throw result;
        }
    }
}
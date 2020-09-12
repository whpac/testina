import EntitySavingException from '../../exceptions/entity_saving';
import FetchingErrorException from '../../exceptions/fetching_error';
import MalformedResponseException from '../../exceptions/malformed_response';
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
        try {
            let result = await XHR.PerformRequest(ApiEndpoints.GetEntityUrl(test), 'PUT', request_data);
            if(result.Status != 204) {
                let malformed_response = new MalformedResponseException('Serwer zwrócił nieoczekiwany kod odpowiedzi. Oczekiwano 204.', {
                    ResponseText: '[Nieznany]',
                    Status: result.Status,
                    StatusText: result.StatusText
                });
                throw new EntitySavingException('Serwer zwrócił nieoczekiwany kod odpowiedzi. Oczekiwano 204.', malformed_response);
            }
        } catch(e) {
            if(e instanceof FetchingErrorException || e instanceof MalformedResponseException) {
                throw new EntitySavingException(e.Message, e);
            }
            throw e;
        }
    }
}
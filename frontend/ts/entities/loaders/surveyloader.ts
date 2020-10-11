import XHR from '../../utils/xhr';
import TestLoader, { TestDescriptor } from './testloader';
import Test from '../test';
import { Collection } from '../entity';

export default class SurveyLoader extends TestLoader {

    /**
     * Wczytuje ankietę o określonym identyfikatorze
     * @param test_id Identyfikator testu
     */
    public static async LoadById(test_id: number) {
        let response = await XHR.PerformRequest('api/surveys/' + test_id.toString() + '?depth=3', 'GET');
        let json = response.Response as TestDescriptor;
        return SurveyLoader.CreateFromDescriptor(json);
    }

    /** Wczytuje wszystkie ankiety utworzone przez bieżącego użytkownika */
    public static async GetCreatedByCurrentUser() {
        let response = await XHR.PerformRequest('api/surveys?depth=4', 'GET');
        let descriptors = response.Response as Collection<TestDescriptor>;
        let out_array: Test[] = [];

        for(let test_id in descriptors) {
            out_array.push(await this.CreateFromDescriptor(descriptors[parseInt(test_id)]));
        }

        return out_array;
    }
}
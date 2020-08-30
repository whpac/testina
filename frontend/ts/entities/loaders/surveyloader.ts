import { Collection } from '../entity';
import * as XHR from '../../utils/xhr';
import Survey from '../survey';
import UserLoader from './userloader';

/** Deskryptor ankiety w odpowiedzi z API */
export interface SurveyDescriptor {
    id: number;
    author_id: number;
    name: string;
    description: string | null;
}

export default class SurveyLoader {
    public readonly SurveyCount: number | undefined;
    protected SurveyDescriptors: Collection<SurveyDescriptor> | undefined;

    constructor(survey_count?: number) {
        this.SurveyCount = survey_count;
    }

    /**
     * Zapisuje deskryptory ankiet do późniejszego wykorzystania
     * @param survey_descriptors Deskryptory ankiet
     */
    public SaveDescriptors(survey_descriptors: Collection<SurveyDescriptor>) {
        this.SurveyDescriptors = survey_descriptors;
    }

    /**
     * Wczytuje ankietę o podanym identyfikatorze
     * @param survey_id Identyfikator ankiety
     */
    public async LoadById(survey_id: number) {
        let descriptor: SurveyDescriptor;
        if(this.SurveyDescriptors?.[survey_id] !== undefined) {
            descriptor = this.SurveyDescriptors[survey_id];
        } else {
            let response = await XHR.PerformRequest('api/surveys/' + survey_id.toString() + '?depth=3', 'GET');
            descriptor = response.Response as SurveyDescriptor;
        }
        return this.CreateFromDescriptor(descriptor);
    }

    /**
     * Tworzy ankietę na podstawie deskryptora
     * @param survey_descriptor Deskryptor ankiety
     */
    public async CreateFromDescriptor(survey_descriptor: SurveyDescriptor) {
        return new Survey(
            survey_descriptor.id,
            await UserLoader.LoadById(survey_descriptor.author_id),
            survey_descriptor.name,
            survey_descriptor.description
        );
    }

    /**
     * Wczytuje wszystkie ankiety utworzone przez bieżącego użytkownika
     */
    public async GetAllMadeByCurrentUser() {
        let descriptors: Collection<SurveyDescriptor>;
        if(this.SurveyDescriptors !== undefined) {
            descriptors = this.SurveyDescriptors;
        } else {
            let response = await XHR.PerformRequest('api/surveys?depth=4', 'GET');
            descriptors = response.Response as Collection<SurveyDescriptor>;
        }

        let out_array: Survey[] = [];
        for(let question_id in descriptors) {
            out_array.push(await this.CreateFromDescriptor(descriptors[parseInt(question_id)]));
        }

        return out_array;
    }

    /**
     * Wczytuje wszystkie ankiety utworzone przez bieżącego użytkownika
     */
    public static GetAllMadeByCurrentUser() {
        return new SurveyLoader().GetAllMadeByCurrentUser();
    }
}
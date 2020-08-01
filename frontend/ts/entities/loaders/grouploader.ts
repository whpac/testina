import * as XHR from '../../utils/xhr';
import Group from '../group';
import { Collection } from '../entity';

/** Deskryptor grupy w odpowiedzi z API */
export interface GroupDescriptor {
    id: number,
    name: string
}

export default class GroupLoader {

    /**
     * Wczytuje grupę o określonym identyfikatorze
     * @param group_id Identyfikator grupy
     */
    public static async LoadById(group_id: number){
        let response = await XHR.Request('api/groups/' + group_id.toString() + '?depth=2', 'GET');
        let json = response.Response as GroupDescriptor;
        return this.CreateFromDescriptor(json);
    }

    /**
     * Tworzy grupę na podstawie deskryptora
     * @param group_descriptor Deskryptor grupy
     */
    public static CreateFromDescriptor(group_descriptor: GroupDescriptor){
        return new Group(
            group_descriptor.id,
            group_descriptor.name
        );
    }

    /** Zwraca wszystkie grupy */
    static async GetAll(){
        let response = await XHR.Request('api/groups?depth=3', 'GET');
        let json = response.Response as Collection<GroupDescriptor>;
        let out_array: Group[] = [];

        Object.keys(json).forEach((group_id) => {
            out_array.push(this.CreateFromDescriptor(json[parseInt(group_id)]));
        });

        return out_array;
    }
}
import FetchingErrorException from '../../exceptions/fetching_error';
import XHR from '../../network/xhr';
import Group from '../group';
import { StringKeyedCollection } from '../question_with_user_answers';

/** Deskryptor grupy w odpowiedzi z API */
export interface GroupDescriptor {
    id: string,
    name: string;
}

export default class GroupLoader {

    /**
     * Wczytuje grupy o określonym identyfikatorze
     * @param group_id Identyfikatory grup
     */
    LoadById(group_id: string): Promise<Group>;
    LoadById(group_id: string[]): Promise<Group[]>;
    public async LoadById(group_id: string | string[]): Promise<Group | Group[]> {
        if(typeof group_id == 'string') {
            let descriptor: GroupDescriptor;
            try {
                let response = await XHR.PerformRequest('api/groups/' + group_id + '?depth=2', 'GET');
                descriptor = response.Response as GroupDescriptor;

                return GroupLoader.CreateFromDescriptor(descriptor);
            } catch(e) {
                if(e instanceof FetchingErrorException) {
                    return GroupLoader.CreateFromDescriptor({
                        id: group_id,
                        name: 'Nie udało się pobrać grupy'
                    });
                }
                throw e;
            }
        } else {
            let groups: Group[] = [];
            for(let id of group_id) {
                try {
                    let response = await XHR.PerformRequest('api/groups/' + id + '?depth=2', 'GET');
                    let descriptor = response.Response as GroupDescriptor;
                    groups.push(GroupLoader.CreateFromDescriptor(descriptor));
                } catch(e) {
                    // W przypadku błędu ładowania jednej z grup nie rób nic
                    if(!(e instanceof FetchingErrorException)) throw e;
                }
            }
            return groups;
        }
    }

    /**
     * Tworzy grupę na podstawie deskryptora
     * @param group_descriptor Deskryptor grupy
     */
    public static CreateFromDescriptor(group_descriptor: GroupDescriptor) {
        return new Group(
            group_descriptor.id,
            group_descriptor.name
        );
    }

    /** Zwraca wszystkie grupy */
    public static async GetAll() {
        let descriptors: StringKeyedCollection<GroupDescriptor>;
        let response = await XHR.PerformRequest('api/groups?depth=3', 'GET');
        descriptors = response.Response as StringKeyedCollection<GroupDescriptor>;

        let groups: Group[] = [];
        for(let group_id in descriptors) {
            let g: Group;
            try {
                g = GroupLoader.CreateFromDescriptor(descriptors[group_id]);
            } catch(e) {
                if(e instanceof TypeError) {
                    g = await GroupLoader.LoadById(group_id);
                } else throw e;
            }
            groups.push(g);
        }

        return groups;
    }

    public static async GetGroupsWithCurrentUser() {
        let descriptors: StringKeyedCollection<GroupDescriptor>;
        let response = await XHR.PerformRequest('api/users/current/groups?depth=3', 'GET');
        descriptors = response.Response as StringKeyedCollection<GroupDescriptor>;

        let groups: Group[] = [];
        for(let group_id in descriptors) {
            let g: Group;
            try {
                g = GroupLoader.CreateFromDescriptor(descriptors[group_id]);
            } catch(e) {
                if(e instanceof TypeError) {
                    g = await GroupLoader.LoadById(group_id);
                } else throw e;
            }
            groups.push(g);
        }

        return groups;
    }

    /**
     * Wczytuje grupy o określonym identyfikatorze
     * @param group_id Identyfikatory grup
     */
    static LoadById(group_id: string): Promise<Group>;
    static LoadById(group_id: string[]): Promise<Group[]>;
    public static async LoadById(group_id: string | string[]): Promise<Group | Group[]> {
        //@ts-ignore
        return new GroupLoader().LoadById(group_id);
    }
}
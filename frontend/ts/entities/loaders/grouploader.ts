import * as XHR from '../../utils/xhr';
import Group from '../group';
import { Collection } from '../entity';
import Loader from './loader';

/** Deskryptor grupy w odpowiedzi z API */
export interface GroupDescriptor {
    id: number,
    name: string
}

export default class GroupLoader implements Loader<Group> {

    /**
     * Wczytuje grupy o określonym identyfikatorze
     * @param group_id Identyfikatory grup
     */
    LoadById(group_id: number): Promise<Group>;
    LoadById(group_id: number[]): Promise<Group[]>;
    public async LoadById(group_id: number | number[]): Promise<Group | Group[]>{
        if(typeof group_id == 'number'){
            let descriptor: GroupDescriptor;
            let response = await XHR.Request('api/groups/' + group_id.toString() + '?depth=2', 'GET');
            descriptor = response.Response as GroupDescriptor;

            try{
                return GroupLoader.CreateFromDescriptor(descriptor);
            }catch(e){
                if(e instanceof TypeError){
                    return GroupLoader.LoadById(group_id);
                }else throw e;
            }
        }else{
            let groups: Group[] = [];
            for(let id of group_id){
                let response = await XHR.Request('api/groups/' + group_id.toString() + '?depth=2', 'GET');
                let descriptor = response.Response as GroupDescriptor;
                groups.push(GroupLoader.CreateFromDescriptor(descriptor));
            }
            return groups;
        }
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
    public static async GetAll(){
        let descriptors: Collection<GroupDescriptor>;
        let response = await XHR.Request('api/groups?depth=3', 'GET');
        descriptors = response.Response as Collection<GroupDescriptor>;

        let groups: Group[] = [];
        for(let group_id in descriptors){
            let g: Group;
            try{
                g = GroupLoader.CreateFromDescriptor(descriptors[parseInt(group_id)]);
            }catch(e){
                if(e instanceof TypeError){
                    g = await GroupLoader.LoadById(parseInt(group_id));
                }else throw e;
            }
            groups.push(g);
        }

        return groups;
    }

    /**
     * Wczytuje grupy o określonym identyfikatorze
     * @param group_id Identyfikatory grup
     */
    static LoadById(group_id: number): Promise<Group>;
    static LoadById(group_id: number[]): Promise<Group[]>;
    public static async LoadById(group_id: number | number[]): Promise<Group | Group[]>{
        //@ts-ignore
        return new GroupLoader().LoadById(group_id);
    }
}
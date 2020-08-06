import * as XHR from '../../utils/xhr';
import Group from '../group';
import { Collection } from '../entity';

/** Deskryptor grupy w odpowiedzi z API */
export interface GroupDescriptor {
    id: number,
    name: string
}

export default class GroupLoader {
    protected GroupDescriptors: Collection<GroupDescriptor>| undefined;

    public SaveDescriptors(group_descriptors: Collection<GroupDescriptor>){
        this.GroupDescriptors = group_descriptors;
    }

    /**
     * Wczytuje grupę o określonym identyfikatorze
     * @param group_id Identyfikator grupy
     */
    public async LoadById(group_id: number): Promise<Group>{
        let descriptor: GroupDescriptor;
        if(this.GroupDescriptors?.[group_id] !== undefined){
            descriptor = this.GroupDescriptors[group_id];
        }else{
            let response = await XHR.Request('api/groups/' + group_id.toString() + '?depth=2', 'GET');
            descriptor = response.Response as GroupDescriptor;
        }
        try{
            return GroupLoader.CreateFromDescriptor(descriptor);
        }catch(e){
            if(e instanceof TypeError){
                return GroupLoader.LoadById(group_id);
            }else throw e;
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
    public async GetAll(){
        let descriptors: Collection<GroupDescriptor>;
        if(this.GroupDescriptors !== undefined){
            descriptors = this.GroupDescriptors;
        }else{
            let response = await XHR.Request('api/groups?depth=3', 'GET');
            descriptors = response.Response as Collection<GroupDescriptor>;
        }

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

    public static async LoadById(group_id: number){
        let loader = new GroupLoader();
        return loader.LoadById(group_id);
    }

    public static async GetAll(){
        let loader = new GroupLoader();
        return loader.GetAll();
    }
}
import * as XHR from '../../utils/xhr';
import UserLoader, { UserDescriptor } from './userloader';
import { Collection } from '../entity';
import Assignment from '../assignment';
import ApiEndpoints from './apiendpoints';
import GroupLoader, { GroupDescriptor } from './grouploader';

/** Deskryptor celów w odpowiedzi z API */
export interface AssignmentTargetsDescriptor {
    groups: Collection<GroupDescriptor>,
    users: Collection<UserDescriptor>
}

export default class AssignmentTargetsLoader {
    public readonly TargetCount: number | undefined;
    protected Assignment: Assignment | undefined;
    protected TargetDescriptor: AssignmentTargetsDescriptor | undefined;

    constructor(target_count?: number){
        this.TargetCount = target_count;
    }

    /**
     * Ustawia przypisanie, dla którego będą wczytywane cele
     * @param assignment Przypisanie, dla którego będą wczytywane cele
     */
    public SetAssignment(assignment: Assignment){
        this.Assignment = assignment;
    }

    /**
     * Zapisuje deskryptory celów do późniejszego wykorzystania
     * @param target_descriptors Deskryptory celów
     */
    public SaveDescriptor(target_descriptors: AssignmentTargetsDescriptor){
        this.TargetDescriptor = target_descriptors;
    }

    /**
     * Wczytuje cele dla bieżącego przypisania
     */
    public async Load(){
        if(this.Assignment === undefined) throw 'AttemptLoader.Assignment nie może być undefined.';

        let descriptor: AssignmentTargetsDescriptor;
        if(this.TargetDescriptor !== undefined){
            descriptor = this.TargetDescriptor;
        }else{
            let response = await XHR.Request(ApiEndpoints.GetEntityUrl(this.Assignment) + '/targets?depth=4', 'GET');
            descriptor = response.Response as AssignmentTargetsDescriptor;
        }

        return this.CreateFromDescriptor(descriptor);
    }

    /**
     * Tworzy cele na podstawie deskryptora
     * @param targets_descriptor Deskryptor celów
     */
    public async CreateFromDescriptor(targets_descriptor: AssignmentTargetsDescriptor){
        if(this.Assignment === undefined) throw 'AttemptLoader.Assignment nie może być undefined.';

        let user_loader = new UserLoader();
        user_loader.SaveDescriptors(targets_descriptor.users);

        let group_loader = new GroupLoader();
        group_loader.SaveDescriptors(targets_descriptor.groups);

        return {
            Groups: await group_loader.GetAll(),
            Users: await user_loader.GetAll()
        }
    }
}
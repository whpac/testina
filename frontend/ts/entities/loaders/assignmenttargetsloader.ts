import * as XHR from '../../utils/xhr';
import UserLoader from './userloader';
import Assignment, { AssignmentTargets } from '../assignment';
import ApiEndpoints from './apiendpoints';
import GroupLoader from './grouploader';

/** Deskryptor celów w odpowiedzi z API */
export interface AssignmentTargetsDescriptor {
    group_ids: string[],
    user_ids: string[],
    all_user_ids: string[];
}

export default class AssignmentTargetsLoader {
    public readonly TargetCount: number | undefined;
    protected Assignment: Assignment | undefined;
    protected TargetDescriptor: AssignmentTargetsDescriptor | undefined;

    constructor(target_count?: number) {
        this.TargetCount = target_count;
    }

    /**
     * Ustawia przypisanie, dla którego będą wczytywane cele
     * @param assignment Przypisanie, dla którego będą wczytywane cele
     */
    public SetAssignment(assignment: Assignment) {
        this.Assignment = assignment;
    }

    /**
     * Zapisuje deskryptory celów do późniejszego wykorzystania
     * @param target_descriptors Deskryptory celów
     */
    public SaveDescriptor(target_descriptors: AssignmentTargetsDescriptor | undefined) {
        this.TargetDescriptor = target_descriptors;
    }

    /**
     * Wczytuje cele dla bieżącego przypisania
     */
    public async Load() {
        if(this.Assignment === undefined) throw 'AssignmentTargetsLoader.Assignment nie może być undefined.';

        let descriptor: AssignmentTargetsDescriptor;
        if(this.TargetDescriptor !== undefined) {
            descriptor = this.TargetDescriptor;
        } else {
            let response = await XHR.PerformRequest(ApiEndpoints.GetEntityUrl(this.Assignment) + '/targets?depth=4', 'GET');
            descriptor = response.Response as AssignmentTargetsDescriptor;
        }

        return this.CreateFromDescriptor(descriptor);
    }

    /**
     * Tworzy cele na podstawie deskryptora
     * @param targets_descriptor Deskryptor celów
     */
    public async CreateFromDescriptor(targets_descriptor: AssignmentTargetsDescriptor): Promise<AssignmentTargets> {
        if(this.Assignment === undefined) throw 'AssignmentTargetsLoader.Assignment nie może być undefined.';

        let group_loader = new GroupLoader();
        let user_loader = new UserLoader();
        let all_user_loader = new UserLoader();

        let group_awaiter = group_loader.LoadById(targets_descriptor.group_ids);
        let user_awaiter = user_loader.LoadById(targets_descriptor.user_ids);
        let all_user_awaiter = all_user_loader.LoadById(targets_descriptor.all_user_ids);

        return {
            Groups: await group_awaiter,
            Users: await user_awaiter,
            AllUsers: await all_user_awaiter
        };
    }
}
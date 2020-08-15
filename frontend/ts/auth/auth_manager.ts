import UserLoader from '../entities/loaders/userloader';

export default class AuthManager {

    static async IsAuthorized() {
        return (await this.GetCurrentUser(true)) !== undefined;
    }

    static async GetCurrentUser(force: boolean = false) {
        return UserLoader.GetCurrent(force);
    }
}
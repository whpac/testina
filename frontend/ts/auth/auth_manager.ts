import UserLoader from '../entities/loaders/userloader';
import * as XHR from '../utils/xhr';

export default class AuthManager {

    public static async IsAuthorized() {
        return (await this.GetCurrentUser(true)) !== undefined;
    }

    public static async GetCurrentUser(force: boolean = false) {
        return UserLoader.GetCurrent(force);
    }

    public static async TryToLogIn(username: string, password: string) {
        let payload = {
            login: username,
            password: password
        };

        let response = await XHR.PerformRequest('api/session', 'POST', payload);
        console.log(response);
    }
}
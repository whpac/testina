import UserLoader from '../entities/loaders/userloader';
import * as XHR from '../utils/xhr';
import CacheManager, { CacheStorages } from '../cache/cache_manager';
import { GoToPage } from '../1page/pagemanager';
import Navbar from '../navbar';

export type AuthResult = {
    is_success: boolean;
    reason: number | null;
};

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

        let result = await XHR.PerformRequest('api/session', 'POST', payload);
        let response = result.Response as AuthResult;

        if(response.is_success) {
            Navbar.AppNavbar.Draw();
        }

        return response;
    }

    public static async LogOut() {
        await XHR.PerformRequest('api/session', 'DELETE');
        (await CacheManager.Open(CacheStorages.Entities)).Purge();
        GoToPage('zaloguj');
    }
}
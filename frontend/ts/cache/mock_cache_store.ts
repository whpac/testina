import CacheStore from './cache_store';

export default class MockCacheStore implements CacheStore {

    public async GetResource(request: Request): Promise<Response | undefined> {
        return undefined;
    }

    public async SaveResponse(request: Request, response: Response): Promise<void> {

    }

    public async InvalidateUrl(url: string, applies_to_children: boolean): Promise<void> {

    }

    public async Purge(): Promise<void> {

    }

}
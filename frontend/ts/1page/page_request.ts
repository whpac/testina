import PageParams from './page_params';

export default class PageRequest {

    public constructor(
        public readonly PageId: string,
        public readonly Params: PageParams | undefined
    ) { }
}
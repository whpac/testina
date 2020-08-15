import BaseException from './base';

export default class FetchingErrorException extends BaseException {
    public readonly Data: FetchingErrorData;

    public constructor(message: string, data: FetchingErrorData) {
        super(message);
        this.Data = data;
    }
}

export type FetchingErrorData = {
    Response: object;
    Status: number;
    StatusText: string;
};
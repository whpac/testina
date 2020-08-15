import BaseException from './base';

export default class MalformedResponseException extends BaseException {
    public readonly Data: MalformedResponseData;

    public constructor(message: string, data: MalformedResponseData) {
        super(message);
        this.Data = data;
    }
}

export type MalformedResponseData = {
    ResponseText: string;
    Status: number;
    StatusText: string;
};
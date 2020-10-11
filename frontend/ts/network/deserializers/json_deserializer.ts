import Deserializer from './deserializer';

export default class JsonDeserializer implements Deserializer {

    GetAcceptableMimeTypes(): string {
        return 'application/json';
    }

    Parse(source: string) {
        return JSON.parse(source);
    }
}
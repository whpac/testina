import { Base64Decode } from '../../utils/textutils';
import Deserializer from './deserializer';

export default class JsonBase64Deserializer implements Deserializer {

    GetAcceptableMimeTypes(): string {
        return 'application/x.json+base64';
    }

    Parse(source: string) {
        return JSON.parse(Base64Decode(source));
    }
}
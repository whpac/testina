import Dialog from '../basic/dialog';
import XHR from '../../utils/xhr';

export default class LicenseDialog extends Dialog {
    protected LicenseText: HTMLElement;

    constructor() {
        super();
        this.DialogElement.classList.add('rich');

        this.SetHeader('Treść licencji');

        this.LicenseText = document.createElement('section');
        this.LicenseText.style.fontFamily = 'serif';
        this.LicenseText.style.whiteSpace = 'pre-wrap';
        this.AddContent(this.LicenseText);

        let close_button = document.createElement('button');
        close_button.textContent = 'Zamknij';
        close_button.addEventListener('click', this.Hide.bind(this));
        this.AddButton(close_button);
    }

    public async Populate(license: string, author: string) {
        this.LicenseText.textContent = 'Wczytywanie...';
        try {
            let license_text = (await XHR.PerformRequest('api/static_data/licenses/' + license.toString())).Response as string;
            license_text = license_text.replace('%author%', author);
            this.LicenseText.textContent = license_text;
        } catch(e) {
            let message = '.';
            if('Message' in e) message = e.Message;

            this.LicenseText.textContent = 'Nie udało się wczytać treści licencji' + message;
        }
    }
}
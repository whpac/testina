import Dialog from '../basic/dialog';
import LicenseStore, { License } from '../../utils/license_store';

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

    public Populate(license: License, author: string) {
        this.LicenseText.textContent = LicenseStore.GetLicenseText(license, author);
    }
}
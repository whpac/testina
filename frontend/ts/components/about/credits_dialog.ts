import Dialog from '../basic/dialog';
import Icon from '../basic/icon';
import LicenseDialog from './license_dialog';

enum License {
    ApacheLicense2 = 'apache2',
    CreativeCommons_BY_3 = 'cc_by_3',
    MIT = 'mit',
    SIL_OpenFontLicense = 'sil_ofl'
}

export default class CreditsDialog extends Dialog {
    protected RowsContainer: HTMLElement;

    constructor() {
        super();

        this.SetHeader('Biblioteki open-source');

        this.RowsContainer = document.createElement('div');
        this.AddContent(this.RowsContainer);

        let close_button = document.createElement('button');
        close_button.textContent = 'Zamknij';
        close_button.addEventListener('click', this.Hide.bind(this));
        this.AddButton(close_button);

        const libs = [
            {
                name: 'FontAwesome',
                author: 'Dave Gandy',
                license: License.SIL_OpenFontLicense
            },
            {
                name: 'Graph.js',
                author: 'Graph.js community',
                license: License.MIT
            },
            {
                name: 'JS-Levenshtein',
                author: 'Gustaf Andersson',
                license: License.MIT
            },
            {
                name: 'Roboto',
                author: 'Christian Robertson',
                license: License.ApacheLicense2
            },
            {
                name: 'Utf8ToExtendedAscii',
                author: 'PHP Documentation Group',
                license: License.CreativeCommons_BY_3
            }
        ];
        for(let lib of libs) {
            this.AddLibrary(lib.name, lib.author, lib.license);
        }
    }

    protected AddLibrary(name: string, author: string, license: License) {
        let row_wrapper = document.createElement('div');
        this.RowsContainer.appendChild(row_wrapper);
        row_wrapper.classList.add('row-wrapper');

        let lib_name = document.createElement('span');
        row_wrapper.appendChild(lib_name);
        lib_name.classList.add('row-heading');
        lib_name.textContent = name;

        let lib_author = document.createElement('span');
        row_wrapper.appendChild(lib_author);
        lib_author.classList.add('row-description');
        lib_author.appendChild((new Icon('user-o')).GetElement());
        lib_author.appendChild(document.createTextNode(' ' + author));

        let lib_license = document.createElement('button');
        row_wrapper.appendChild(lib_license);
        lib_license.classList.add('row-button');
        lib_license.appendChild((new Icon('balance-scale')).GetElement());
        lib_license.title = 'Wyświetl licencję';
        lib_license.addEventListener('click', (() => {
            let license_dialog = new LicenseDialog();
            license_dialog.Populate(license, author);
            license_dialog.Show();
        }).bind(this));
    }
}
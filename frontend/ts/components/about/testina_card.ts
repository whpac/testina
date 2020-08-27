import Card from '../basic/card';
import CreditsDialog from './credits_dialog';
import { GoToPage } from '../../1page/pagemanager';

export default class TestinaCard extends Card {

    constructor() {
        super('auto-width');

        this.GetElement().style.marginTop = '60px';

        let logo_wrapper = document.createElement('div');
        this.AppendChild(logo_wrapper);
        logo_wrapper.classList.add('about-logo-wrapper');

        let logo_backplate = document.createElement('div');
        logo_wrapper.appendChild(logo_backplate);
        logo_backplate.classList.add('logo-backplate');

        let logo = document.createElement('img');
        logo_backplate.appendChild(logo);
        logo.classList.add('logo');
        logo.src = 'images/logo/testina.svg';

        let app_name_heading = document.createElement('h2');
        this.AppendChild(app_name_heading);
        app_name_heading.classList.add('center');
        app_name_heading.textContent = 'Testina';

        let copyright_text = document.createElement('p');
        this.AppendChild(copyright_text);
        copyright_text.classList.add('secondary', 'center');
        copyright_text.textContent = 'Copyright © 2020, Marcin Szwarc';

        let bottom_links = document.createElement('div');
        this.AppendChild(bottom_links);
        bottom_links.classList.add('center', 'small');

        let links: [string, () => void][] = [
            ['Regulamin', () => void 0],
            ['Wykorzystane\xa0biblioteki', this.DisplayCredits],
            ['Pomoc', () => GoToPage('pomoc')]
        ];

        for(let i = 0; i < links.length; i++) {
            if(i > 0) {
                let separator = document.createTextNode(' • ');
                bottom_links.appendChild(separator);
            }

            let a = document.createElement('a');
            bottom_links.appendChild(a);
            a.classList.add('no-color');
            a.href = 'javascript:void(0)';
            a.textContent = links[i][0];
            a.addEventListener('click', links[i][1].bind(this));
        }
    }

    protected DisplayCredits() {
        let credits_dialog = new CreditsDialog();
        credits_dialog.Show();
    }
}
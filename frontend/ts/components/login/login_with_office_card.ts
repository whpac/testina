import Card from '../basic/card';

export default class LoginWithOfficeCard extends Card {

    constructor() {
        super('auto-width', 'login-form');

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

        // @ts-ignore
        if(window._debug) {
            logo.src = 'images/logo/testina.dev.svg';
        } else {
            logo.src = 'images/logo/testina.svg';
        }

        let app_name_heading = document.createElement('h2');
        this.AppendChild(app_name_heading);
        app_name_heading.classList.add('center');
        app_name_heading.textContent = 'Logowanie do Testiny';

        let link_wrapper = document.createElement('div');
        link_wrapper.style.textAlign = 'center';
        this.AppendChild(link_wrapper);

        let link = document.createElement('a');
        link.classList.add('button');
        link.href = `https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize?
client_id=7f546198-c3b7-45d0-a98f-091f54cd94b6
&response_type=code
&redirect_uri=http%3A%2F%2Flocalhost%2Fp%2Foffice_login
&response_mode=query
&scope=user.read
&state=12345`;
        link.textContent = 'Zaloguj';
        link_wrapper.appendChild(link);

        let description = document.createElement('p');
        description.classList.add('secondary', 'small', 'center');
        this.AppendChild(description);

        description.appendChild(document.createTextNode('Po kliknieciu Zaloguj, zostaniesz'));
        description.appendChild(document.createElement('br'));
        description.appendChild(document.createTextNode('przeniesiony(-a) do strony logowania Office 365.'));
    }
}
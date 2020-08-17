import Card from '../basic/card';

export default class LoginCard extends Card {

    constructor() {
        super('auto-width', 'login-form');

        let header = document.createElement('h2');
        this.AppendChild(header);
        header.textContent = 'Zaloguj się';

        let login_label = document.createElement('label');
        this.AppendChild(login_label);
        login_label.textContent = 'Login:';

        let login_input = document.createElement('input');
        this.AppendChild(login_input);
        login_input.type = 'text';
        login_input.name = 'testina-login';
        login_input.autocomplete = 'username';
        login_input.id = login_label.htmlFor = 'login-input';

        let password_label = document.createElement('label');
        this.AppendChild(password_label);
        password_label.textContent = 'Hasło:';

        let password_input = document.createElement('input');
        this.AppendChild(password_input);
        password_input.type = 'password';
        password_input.name = 'testina-password';
        password_input.autocomplete = 'current-password';
        password_input.id = password_label.htmlFor = 'password-input';

        let submit_button = document.createElement('button');
        this.AppendChild(submit_button);
        submit_button.textContent = 'Zaloguj';

        let login_message = document.createElement('span');
        login_message.classList.add('login-message');
    }
}
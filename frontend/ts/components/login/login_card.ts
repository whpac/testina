import Card from '../basic/card';
import AuthManager from '../../auth/auth_manager';
import { LoadInitialPage } from '../../script';

export default class LoginCard extends Card {

    constructor() {
        super('auto-width', 'login-form');

        let header = document.createElement('h2');
        this.AppendChild(header);
        header.textContent = 'Zaloguj się';

        let login_form = document.createElement('form');
        this.AppendChild(login_form);
        login_form.classList.add('grid-form');
        login_form.action = '#';

        let login_label = document.createElement('label');
        login_form.appendChild(login_label);
        login_label.textContent = 'Login:';

        let login_input = document.createElement('input');
        login_form.appendChild(login_input);
        login_input.type = 'text';
        login_input.name = 'testina-login';
        login_input.autocomplete = 'username';
        login_input.id = login_label.htmlFor = 'login-input';

        let password_label = document.createElement('label');
        login_form.appendChild(password_label);
        password_label.textContent = 'Hasło:';

        let password_input = document.createElement('input');
        login_form.appendChild(password_input);
        password_input.type = 'password';
        password_input.name = 'testina-password';
        password_input.autocomplete = 'current-password';
        password_input.id = password_label.htmlFor = 'password-input';

        let submit_button = document.createElement('button');
        login_form.appendChild(submit_button);
        submit_button.textContent = 'Zaloguj';
        submit_button.type = 'submit';

        let login_message = document.createElement('span');
        login_form.appendChild(login_message);
        login_message.classList.add('login-message');

        login_form.addEventListener('submit', (async (e: Event) => {
            e.preventDefault();

            let login = login_input.value;
            let password = password_input.value;

            if(login == '' || password == '') {
                login_message.textContent = 'Pola „Login” i „Hasło” są wymagane.';
                return;
            }

            let result = await AuthManager.TryToLogIn(login, password);
            if(!result.is_success) {
                login_message.textContent = 'Nieprawidłowy login lub hasło.';
                return;
            }

            login_message.textContent = '';
            LoadInitialPage();
        }).bind(this));
    }
}
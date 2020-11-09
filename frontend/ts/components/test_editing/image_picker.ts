import Component from '../basic/component';

export default class ImagePicker extends Component {

    public constructor(picker_id: string) {
        super();

        this.Element.classList.add('input-like');

        let drop_container = document.createElement('div');
        drop_container.classList.add('file-drop-container');
        this.AppendChild(drop_container);

        let empty_placeholder = document.createElement('div');
        empty_placeholder.classList.add('no-files-placeholder');
        empty_placeholder.textContent = 'Upuść pliki tutaj lub kliknij przycisk poniżej.';
        drop_container.appendChild(empty_placeholder);

        let pick_button = document.createElement('button');
        pick_button.textContent = 'Wybierz pliki';
        this.AppendChild(pick_button);
    }
}
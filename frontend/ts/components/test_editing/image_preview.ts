import NavigationPrevention from '../../1page/navigation_prevention';
import Component from '../basic/component';
import Icon from '../basic/icon';

export default class ImagePreview extends Component<'delete' | 'undelete'> {
    public IsDeleted: boolean;
    public readonly IsJustSelected: boolean;
    public readonly FileObject: File | undefined;
    protected DeleteButton: HTMLButtonElement;
    protected UndeleteButton: HTMLButtonElement;

    public constructor(image_id: number | File, image_type: ImageType) {
        super();

        this.Element.classList.add('image-preview');
        this.IsDeleted = false;
        this.IsJustSelected = image_type == ImageType.JUST_SELECTED;

        let img_element = document.createElement('img');
        img_element.title = 'Kliknij, by powiększyć.';
        this.Element.appendChild(img_element);

        if(typeof image_id == 'number') {
            img_element.src = 'api/static_data/question_images/' + image_id;
        } else {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result;
                if(result === null) return;
                img_element.src = result.toString();
            };
            reader.readAsDataURL(image_id);
            this.FileObject = image_id;
        }

        this.DeleteButton = document.createElement('button');
        this.DeleteButton.classList.add('delete-image');
        this.DeleteButton.appendChild(new Icon('trash', 'error').GetElement());
        this.DeleteButton.title = 'Usuń obraz';
        this.DeleteButton.addEventListener('click', this.OnDeleteClick.bind(this));
        this.Element.appendChild(this.DeleteButton);

        this.UndeleteButton = document.createElement('button');
        this.UndeleteButton.classList.add('delete-image');
        this.UndeleteButton.appendChild(new Icon('undo').GetElement());
        this.UndeleteButton.title = 'Przywróć obraz';
        this.UndeleteButton.style.display = 'none';
        this.UndeleteButton.addEventListener('click', this.OnUndeleteClick.bind(this));
        this.Element.appendChild(this.UndeleteButton);
    }

    protected OnDeleteClick() {
        this.DeleteButton.style.display = 'none';
        this.UndeleteButton.style.display = '';

        this.Element.classList.add('deleted');
        this.IsDeleted = true;

        NavigationPrevention.Prevent('question-editor');
        this.FireEvent('delete');
    }

    protected OnUndeleteClick() {
        this.DeleteButton.style.display = '';
        this.UndeleteButton.style.display = 'none';

        this.Element.classList.remove('deleted');
        this.IsDeleted = false;

        NavigationPrevention.Prevent('question-editor');
        this.FireEvent('undelete');
    }
}

export enum ImageType {
    ALREADY_SAVED,
    JUST_SELECTED
}
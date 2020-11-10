import Component from '../basic/component';
import ImagePreview from './image_preview';

export default class ImagePicker extends Component {
    protected DropContainer: HTMLDivElement;

    public constructor(picker_id: string) {
        super();

        this.Element.classList.add('input-like');

        this.DropContainer = document.createElement('div');
        this.DropContainer.classList.add('file-drop-container');
        this.AppendChild(this.DropContainer);

        let empty_placeholder = document.createElement('div');
        empty_placeholder.classList.add('no-files-placeholder');
        empty_placeholder.textContent = 'Upuść pliki tutaj lub kliknij przycisk poniżej.';
        this.DropContainer.appendChild(empty_placeholder);

        let pick_button = document.createElement('button');
        pick_button.textContent = 'Wybierz pliki';
        this.AppendChild(pick_button);

        let file_picker_input = document.createElement('input');
        file_picker_input.classList.add('visually-hidden');
        file_picker_input.type = 'file';
        file_picker_input.multiple = true;
        file_picker_input.accept = 'image/*';
        file_picker_input.id = picker_id;
        this.AppendChild(file_picker_input);

        this.DropContainer.addEventListener("dragenter", this.OnDragEnterOrLeave.bind(this), false);
        this.DropContainer.addEventListener("dragover", this.OnDragEnterOrLeave.bind(this), false);
        this.DropContainer.addEventListener("drop", this.OnFilesDropped.bind(this), false);

        pick_button.addEventListener('click', () => file_picker_input.click());
        file_picker_input.addEventListener('change', this.OnFilesSelected.bind(this));
    }

    public Populate(image_ids: number[]) {
        for(let image_id of image_ids) {
            this.DropContainer.appendChild(new ImagePreview(image_id).GetElement());
        }
    }

    protected HandleFilesSelected(files: FileList) {
        for(let file of files) {
            this.DropContainer.appendChild(document.createTextNode(file.size.toString()));
        }
    }

    protected OnFilesSelected(e: Event) {
        let fileList = (e.target as HTMLInputElement)?.files;
        if(fileList) this.HandleFilesSelected(fileList);
    }

    protected OnDragEnterOrLeave(e: DragEvent) {
        e.stopPropagation();
        e.preventDefault();
    }

    protected OnFilesDropped(e: DragEvent) {
        e.stopPropagation();
        e.preventDefault();

        let dt = e.dataTransfer;
        let files = dt?.files;

        if(files !== undefined) this.HandleFilesSelected(files);
    }
}
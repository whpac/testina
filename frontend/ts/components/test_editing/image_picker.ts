import NavigationPrevention from '../../1page/navigation_prevention';
import Component from '../basic/component';
import ImagePreview, { ImageType } from './image_preview';

export default class ImagePicker extends Component {
    protected DropContainer: HTMLDivElement;
    protected EmptyPlaceholder: HTMLDivElement;
    protected ImagePreviewers: ImagePreview[];

    public constructor(picker_id: string) {
        super();

        this.ImagePreviewers = [];
        this.Element.classList.add('input-like');

        this.DropContainer = document.createElement('div');
        this.DropContainer.classList.add('file-drop-container');
        this.AppendChild(this.DropContainer);

        this.EmptyPlaceholder = document.createElement('div');
        this.EmptyPlaceholder.classList.add('no-files-placeholder');
        this.EmptyPlaceholder.textContent = 'Upuść pliki tutaj lub kliknij przycisk poniżej.';
        this.DropContainer.appendChild(this.EmptyPlaceholder);

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
        this.DropContainer.textContent = '';
        this.DropContainer.appendChild(this.EmptyPlaceholder);
        this.ImagePreviewers = [];

        for(let image_id of image_ids) {
            let ip = new ImagePreview(image_id, ImageType.ALREADY_SAVED);
            this.ImagePreviewers.push(ip);
            this.DropContainer.appendChild(ip.GetElement());
        }

        this.EmptyPlaceholder.style.display = (image_ids.length == 0) ? '' : 'none';
    }

    protected HandleFilesSelected(files: FileList) {
        for(let file of files) {
            if(!file.type.startsWith('image/')) continue;

            let ip = new ImagePreview(file, ImageType.JUST_SELECTED);
            this.ImagePreviewers.push(ip);
            this.DropContainer.appendChild(ip.GetElement());

            NavigationPrevention.Prevent('question-editor');
            this.EmptyPlaceholder.style.display = 'none';
        }
    }

    protected OnFilesSelected(e: Event) {
        if(e.target == null) return;
        let fileList = (e.target as HTMLInputElement).files;

        if(fileList) this.HandleFilesSelected(fileList);
        (e.target as HTMLInputElement).value = '';
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

    public GetFilesToAdd(): File[] {
        let files = [];

        for(let ip of this.ImagePreviewers) {
            if(!ip.IsJustSelected || ip.FileObject === undefined) continue;
            if(ip.IsDeleted) continue;

            files.push(ip.FileObject);
        }

        return files;
    }

    public GetFilesToRemove(): number[] {
        let files = [];

        for(let ip of this.ImagePreviewers) {
            if(ip.IsJustSelected || ip.ImageId === undefined) continue;
            if(!ip.IsDeleted) continue;

            files.push(ip.ImageId);
        }

        return files;
    }
}
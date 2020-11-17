import Dialog from '../basic/dialog';

export default class ImagePreviewDialog extends Dialog {
    protected ImageElement: HTMLImageElement;

    public constructor() {
        super();

        this.DialogElement.classList.add('rich');
        this.ContentWrapper.classList.add('centered');

        this.SetHeader('Podgląd');

        this.ImageElement = document.createElement('img');
        this.AddContent(this.ImageElement);

        let close_btn = document.createElement('button');
        close_btn.textContent = 'Zamknij';
        close_btn.addEventListener('click', this.Hide.bind(this));
        this.AddButton(close_btn);
    }

    public SetImage(image_url: string) {
        this.ImageElement.src = image_url;
    }
}
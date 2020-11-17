import Component from '../basic/component';

export default class QuestionImage extends Component<'requestenlarge'> {
    protected ImageElement: HTMLImageElement;

    public constructor(image_id: number, attempt_id: number) {
        super();

        this.Element.classList.add('question-image');

        this.ImageElement = document.createElement('img');
        this.ImageElement.title = 'Kliknij, aby powiększyć.';
        this.ImageElement.src = 'api/static_data/question_images/' + image_id + '?attempt=' + attempt_id;
        this.ImageElement.addEventListener('click', (() => this.FireEvent('requestenlarge')).bind(this));

        this.Element.appendChild(this.ImageElement);
    }

    public GetImageUrl() {
        return this.ImageElement.src;
    }
}
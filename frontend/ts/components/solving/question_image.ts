import Component from '../basic/component';

export default class QuestionImage extends Component {
    protected ImageId: number;

    public constructor(image_id: number) {
        super();
        this.ImageId = image_id;

        let img_element = document.createElement('img');
        img_element.src = 'api/static_data/question_images/' + image_id;

        this.Element.appendChild(img_element);
    }
}
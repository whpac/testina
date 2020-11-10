import Component from '../basic/component';

export default class ImagePreview extends Component<'delete' | 'undelete'> {

    public constructor(image_id: number) {
        super();

        let img_element = document.createElement('img');
        img_element.src = 'api/static_data/question_images/' + image_id;

        this.Element.appendChild(img_element);
    }
}
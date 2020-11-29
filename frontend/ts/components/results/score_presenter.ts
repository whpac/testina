import { n } from '../../utils/textutils';
import Component from '../basic/component';

export default class ScorePresenter extends Component<"change-score"> {

    public constructor(got: number, total: number | undefined) {
        super();

        this.Element = document.createElement('div');

        let pts_form = 'punkt' + n(got, '', 'y', 'ów', 'a');
        let total_form = 'możliw' + n(total ?? 0, 'y', 'e', 'ych');

        let pts_text = 'Przyznano ' + got.toLocaleString() + ' ' + pts_form;
        if(total !== undefined) {
            pts_text += ' na ' + total.toLocaleString() + ' ' + total_form;
        }
        pts_text += '. ';

        this.Element.textContent = pts_text;

        let change_link = document.createElement('a');
        change_link.classList.add('todo');
        change_link.textContent = 'Zmień';
        change_link.href = '#';
        this.AppendChild(change_link);
    }
}
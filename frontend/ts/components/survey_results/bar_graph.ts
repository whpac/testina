import Component from '../basic/component';

export default class BarGraph extends Component {

    public constructor() {
        super();

        this.Element.classList.add('graph');
        this.AppendChild('Graph');
    }
}
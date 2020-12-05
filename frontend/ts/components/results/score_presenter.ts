import { n } from '../../utils/textutils';
import Component from '../basic/component';

export default class ScorePresenter extends Component<"change-score"> {
    protected ScoreGotText: HTMLElement;
    protected _ScoreGot: number;
    protected MaximumScore: number | undefined;
    protected ChangeLink: HTMLAnchorElement;
    protected SaveLink: HTMLAnchorElement;
    protected ScoreInputWrapper: HTMLElement;
    protected ScoreInput: HTMLInputElement;

    public get ScoreGot() {
        return this._ScoreGot;
    }

    public constructor(got: number, total: number | undefined) {
        super();

        this.Element = document.createElement('div');
        this.ScoreGotText = document.createElement('span');
        this._ScoreGot = got;
        this.MaximumScore = total;

        let total_form = 'możliw' + n(total ?? 0, 'y', 'e', 'ych');

        this.Element.textContent = 'Przyznano ';
        this.AppendChild(this.ScoreInputWrapper = document.createElement('span'));
        this.SetScoreGot(got);
        this.Element.appendChild(this.ScoreGotText);
        if(total !== undefined) {
            this.Element.appendChild(document.createTextNode(' na ' + total.toLocaleString() + ' ' + total_form));
        }
        this.Element.appendChild(document.createTextNode('. '));

        this.ChangeLink = document.createElement('a');
        this.ChangeLink.textContent = 'Zmień';
        this.ChangeLink.addEventListener('click', this.EnterChangeMode.bind(this));
        this.AppendChild(this.ChangeLink);

        this.SaveLink = document.createElement('a');
        this.SaveLink.textContent = 'Zapisz';
        this.SaveLink.addEventListener('click', this.SaveChanges.bind(this));
        this.SaveLink.style.display = 'none';
        this.AppendChild(this.SaveLink);

        this.ScoreInputWrapper.style.display = 'none';

        this.ScoreInput = document.createElement('input');
        this.ScoreInput.type = 'number';
        this.ScoreInput.min = '0';
        this.ScoreInput.value = got.toString();
        if(total !== undefined) this.ScoreInput.max = total.toString();
        this.ScoreInput.step = 'any';
        this.ScoreInput.addEventListener('keyup', this.OnKeyUp.bind(this));
        this.ScoreInputWrapper.appendChild(this.ScoreInput);
        this.ScoreInputWrapper.appendChild(document.createTextNode(' punktów'));
    }

    protected SetScoreGot(points: number) {
        let pts_form = 'punkt' + n(points, '', 'y', 'ów', 'a');
        this.ScoreGotText.textContent = points.toLocaleString() + ' ' + pts_form;
        this._ScoreGot = points;
    }

    protected EnterChangeMode() {
        this.ScoreInputWrapper.style.display = '';
        this.ScoreGotText.style.display = 'none';
        this.ChangeLink.style.display = 'none';
        this.SaveLink.style.display = '';
    }

    protected OnKeyUp(e: KeyboardEvent) {
        if(e.key != 'Enter') return;
        this.SaveChanges();
    }

    protected SaveChanges() {
        let points = parseFloat(this.ScoreInput.value);
        if(points < 0) {
            alert('Minimalna ilość punktów to 0.');
            return;
        }
        if(this.MaximumScore !== undefined && points > this.MaximumScore) {
            alert('Maksymalna iość punktów to ' + this.MaximumScore + '.');
            return;
        }
        if(isNaN(points)) {
            alert('Podano niepoprawną liczbę.');
            return;
        }

        this.SetScoreGot(points);
        this.FireEvent('change-score');

        this.ScoreInputWrapper.style.display = 'none';
        this.ScoreGotText.style.display = '';
        this.ChangeLink.style.display = '';
        this.SaveLink.style.display = 'none';
    }
}
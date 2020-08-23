import Component from '../../basic/component';
import UserLoader from '../../../entities/loaders/userloader';

export default class AllTestsSolved extends Component {

    public constructor(hidden: boolean = false) {
        super();

        this.Element.classList.add('empty-placeholder');
        if(hidden) this.Element.style.display = 'none';

        let img = document.createElement('img');
        img.src = 'images/all_tests_solved.svg';
        this.AppendChild(img);

        let em = document.createElement('em');
        this.AppendChild(em);
        (async () => em.textContent = 'Rozwiązał' + ((await UserLoader.GetCurrent())?.IsFemale() ? 'a' : 'e') + 'ś już wszystkie testy')();

        let span = document.createElement('span');
        this.AppendChild(span);
        span.textContent = 'Czas odpocząć! ';

        let emoji = document.createElement('span');
        span.appendChild(emoji);
        emoji.classList.add('emoji');
        emoji.textContent = '🌴';
    }
}
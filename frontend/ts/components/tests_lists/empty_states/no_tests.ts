import Component from '../../basic/component';

export default class NoTests extends Component {

    public constructor(hidden: boolean = false) {
        super();

        this.Element.classList.add('empty-placeholder');
        if(hidden) this.Element.style.display = 'none';

        let img = document.createElement('img');
        img.src = 'images/file_not_found.svg';
        this.AppendChild(img);

        let em = document.createElement('em');
        this.AppendChild(em);
        em.textContent = 'Nie masz żadnych testów';

        let span = document.createElement('span');
        this.AppendChild(span);
        span.textContent = 'Nie oznacza to, że zawsze tak będzie ';

        let emoji = document.createElement('span');
        span.appendChild(emoji);
        emoji.classList.add('emoji');
        emoji.textContent = '🙃';
    }
}
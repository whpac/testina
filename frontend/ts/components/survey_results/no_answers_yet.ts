import Component from '../basic/component';

export default class NoAnswersYet extends Component {

    public constructor(hidden: boolean = false) {
        super();

        this.Element.classList.add('empty-placeholder');
        if(hidden) this.Element.style.display = 'none';

        let img = document.createElement('img');
        img.src = 'images/empty_paper.svg';
        this.AppendChild(img);

        let em = document.createElement('em');
        this.AppendChild(em);
        em.textContent = 'Nikt jeszcze nie wypełnił tej ankiety';

        let span = document.createElement('span');
        this.AppendChild(span);
        span.textContent = 'Wróć później, aby zobaczyć wyniki.';
        span.appendChild(document.createElement('br'));
    }
}
import Component from '../basic/component';

export default class NoSurveysAssigned extends Component {

    public constructor(hidden: boolean = false) {
        super();

        this.Element.classList.add('empty-placeholder');
        if(hidden) this.Element.style.display = 'none';

        let img = document.createElement('img');
        img.src = 'images/empty_box.svg';
        this.AppendChild(img);

        let em = document.createElement('em');
        this.AppendChild(em);
        em.textContent = 'Nie udostępniono Ci jeszcze żadnych ankiet';

        let span = document.createElement('span');
        this.AppendChild(span);
        span.textContent = 'W tym miejscu będą się wyświetlały wszystkie ankiety, które zostaną Ci udostępnione.';
        span.appendChild(document.createElement('br'));
    }
}
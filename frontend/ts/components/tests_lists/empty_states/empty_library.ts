import Component from '../../basic/component';

export default class EmptyLibrary extends Component<"create-first-test"> {

    public constructor(hidden: boolean = false) {
        super();

        this.Element.classList.add('empty-placeholder');
        if(hidden) this.Element.style.display = 'none';

        let img = document.createElement('img');
        img.src = 'images/empty_box.svg';
        this.AppendChild(img);

        let em = document.createElement('em');
        this.AppendChild(em);
        em.textContent = 'Nie masz jeszcze żadnych testów w swojej bibliotece';

        let span = document.createElement('span');
        this.AppendChild(span);
        span.textContent = 'W tym miejscu będą się wyświetlały wszystkie testy, które utworzysz.';
        span.appendChild(document.createElement('br'));

        let create_first = document.createElement('a');
        span.appendChild(create_first);
        create_first.href = 'javascript:void(0)';
        create_first.textContent = 'Utwórz swój pierwszy test';
        create_first.addEventListener('click', (() => this.FireEvent('create-first-test')).bind(this));
    }
}